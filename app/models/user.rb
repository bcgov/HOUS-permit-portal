class User < ApplicationRecord
  PASSWORD_REGEX = /\A(?=.*[A-Za-z])(?=.*\d)(?=.*[\W_]).{8,64}\z/
  searchkick searchable: %i[first_name last_name email],
             word_start: %i[first_name last_name email]

  include Devise::JWT::RevocationStrategies::Allowlist
  include Discard::Model

  devise :invitable,
         :database_authenticatable,
         :confirmable,
         :rememberable,
         :timeoutable,
         :jwt_cookie_authenticatable,
         :jwt_authenticatable,
         :omniauthable,
         :trackable,
         omniauth_providers: %i[keycloak],
         jwt_revocation_strategy: self

  enum role: {
         submitter: 0,
         review_manager: 1,
         reviewer: 2,
         super_admin: 3,
         regional_review_manager: 4
       },
       _default: 0

  # https://github.com/waiting-for-dev/devise-jwt
  self.skip_session_storage = %i[http_auth params_auth]

  # Associations
  has_many :jurisdiction_memberships, dependent: :destroy
  has_many :jurisdictions, through: :jurisdiction_memberships
  has_many :integration_mapping_notifications,
           as: :notifiable,
           dependent: :destroy

  has_many :permit_applications,
           foreign_key: "submitter_id",
           dependent: :destroy
  has_many :applied_jurisdictions,
           through: :permit_applications,
           source: :jurisdiction
  has_many :license_agreements,
           class_name: "UserLicenseAgreement",
           dependent: :destroy
  has_many :contacts, as: :contactable, dependent: :destroy
  has_many :collaborators, as: :collaboratorable, dependent: :destroy
  has_many :collaborations,
           foreign_key: "user_id",
           class_name: "Collaborator",
           dependent: :destroy
  has_one :preference, dependent: :destroy
  accepts_nested_attributes_for :preference

  # Validations
  validate :valid_role_change, if: :role_changed?, on: :update
  validate :jurisdiction_must_belong_to_correct_roles
  validate :confirmed_user_has_fields
  validate :unique_omniauth_uid
  validate :single_jurisdiction, unless: :regional_review_manager?

  after_commit :refresh_search_index, if: :saved_change_to_discarded_at
  after_commit :reindex_jurisdiction_user_size
  before_save :create_default_preference

  # Stub this for now since we do not want to use IP Tracking at the moment - Jan 30, 2024
  attr_accessor :current_sign_in_ip, :last_sign_in_ip
  attr_accessor :collaboration_invitation # this is needed to signal that a registration invitation is for collaboration when sending the email

  after_discard { destroy_jurisdiction_collaborator }
  after_save :create_jurisdiction_collaborator,
             if: :saved_change_to_discarded_at

  delegate :sandboxes, to: :jurisdiction

  def confirmation_required?
    false
  end

  def eula_variant
    {
      submitter: "open",
      reviewer: "employee",
      review_manager: "employee",
      regional_review_manager: "employee",
      super_admin: nil
    }[
      role.to_sym
    ]
  end

  def name
    "#{first_name} #{last_name}"
  end

  def search_data
    {
      updated_at: updated_at,
      created_at: created_at,
      role: role,
      name: name,
      first_name: first_name,
      last_name: last_name,
      email: email,
      jurisdiction_ids: jurisdictions.pluck(:id),
      discarded: discarded_at.present?,
      last_sign_in_at: last_sign_in_at
    }
  end

  def invitable_roles
    case role
    when "super_admin"
      %w[reviewer review_manager super_admin regional_review_manager]
    when "review_manager", "regional_review_manager"
      %w[reviewer review_manager]
    else
      []
    end
  end

  def staff?
    review_staff? || super_admin?
  end

  def manager?
    review_manager? || regional_review_manager?
  end

  def review_staff?
    reviewer? || review_manager? || regional_review_manager?
  end

  def role_name
    role.gsub("_", " ")
  end

  def blueprint
    UserBlueprint
  end

  def set_collaboration_invitation(permit_collaboration)
    self.collaboration_invitation = {
      permit_collaboration: permit_collaboration
    }
  end

  def create_jurisdiction_collaborator
    return unless review_staff? && kept?

    jurisdictions.each do |jurisdiction|
      existing_collaborator = jurisdiction.collaborators.find_by(user_id: id)

      next if existing_collaborator.present?

      jurisdiction.collaborators.create(user: self)
    end
  end

  private

  def destroy_jurisdiction_collaborator
    return unless discarded?

    jurisdictions.each do |jurisdiction|
      existing_collaborator = jurisdiction.collaborators.find_by(user_id: id)

      next unless existing_collaborator.present?

      existing_collaborator.destroy
    end
  end

  def create_default_preference
    return unless preference.blank?

    build_preference(
      enable_in_app_new_template_version_publish_notification: true,
      enable_email_new_template_version_publish_notification: true,
      enable_in_app_customization_update_notification: true,
      enable_email_customization_update_notification: true
    ).save
  end

  def reindex_jurisdiction_user_size
    return unless jurisdictions.any?

    # TODO: if jurisdictions changed?
    jurisdictions.reindex if saved_change_to_role? || destroyed? || new_record?
  end

  def refresh_search_index
    User.search_index.refresh
  end

  def confirmed_user_has_fields
    unless !confirmed? || first_name.present?
      errors.add(:user, "Confirmed user must have first_name")
    end
    unless !confirmed? || last_name.present?
      errors.add(:user, "Confirmed user must have last_name")
    end
    unless !confirmed? || email.present?
      errors.add(:user, "Confirmed user must have email")
    end
  end

  def jurisdiction_must_belong_to_correct_roles
    if jurisdictions.any? && !review_staff?
      errors.add(:jurisdictions, :reviewers_only)
    end
  end

  def unique_omniauth_uid
    return unless omniauth_uid.present?
    existing_user =
      User
        .where.not(omniauth_uid: nil)
        .find_by(omniauth_uid:, omniauth_provider:)
    return unless existing_user && existing_user != self
    if !super_admin?
      errors.add(
        :base,
        :bceid_taken,
        jurisdiction: existing_user.jurisdictions.first&.name
      )
    elsif super_admin?
      errors.add(:base, :idir_taken)
    end
  end

  def single_jurisdiction
    return if jurisdictions.count <= 1
    errors.add(:base, :single_jurisdiction)
  end

  def valid_role_change
    errors.add(:base, :admin_role_change) if role_was.to_sym == :super_admin
  end
end
