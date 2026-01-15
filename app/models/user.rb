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

  enum :role,
       {
         submitter: 0,
         review_manager: 1,
         reviewer: 2,
         super_admin: 3,
         regional_review_manager: 4,
         technical_support: 5
       },
       default: 0

  # https://github.com/waiting-for-dev/devise-jwt
  self.skip_session_storage = %i[http_auth params_auth]

  # Associations
  has_many :pre_checks,
           foreign_key: "creator_id",
           dependent: :destroy,
           inverse_of: :creator
  has_many :jurisdiction_memberships, dependent: :destroy
  has_many :jurisdictions, through: :jurisdiction_memberships
  has_many :integration_mapping_notifications,
           as: :notifiable,
           dependent: :destroy

  has_many :permit_applications,
           foreign_key: "submitter_id",
           dependent: :destroy,
           inverse_of: :submitter

  has_many :created_step_codes,
           class_name: "StepCode",
           foreign_key: "creator_id",
           inverse_of: :creator,
           dependent: :destroy

  has_many :permit_projects,
           class_name: "PermitProject",
           foreign_key: :owner_id,
           dependent: :destroy,
           inverse_of: :owner

  has_many :pinned_projects, dependent: :destroy
  has_many :pinned_permit_projects,
           through: :pinned_projects,
           source: :permit_project

  # New intermediate association for jurisdictions applied for via permit applications
  has_many :application_projects,
           through: :permit_applications,
           source: :permit_project

  has_many :applied_jurisdictions,
           through: :application_projects,
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

  has_many :early_access_previews,
           dependent: :destroy,
           foreign_key: :previewer_id
  has_many :early_access_requirement_templates, through: :early_access_previews

  has_one :preference, dependent: :destroy
  accepts_nested_attributes_for :preference

  # Validations
  validates :role, presence: true
  validate :valid_role_change, if: :role_changed?, on: :update
  validate :jurisdiction_must_belong_to_correct_roles
  validate :confirmed_user_has_fields
  validate :unique_omniauth_uid
  validate :omniauth_provider_appropriate_for_role
  validate :single_jurisdiction, unless: :regional_review_manager?

  after_commit :refresh_search_index, if: :saved_change_to_discarded_at
  after_commit :revoke_jwt_allowlist, if: :should_revoke_jwt_allowlist?
  after_commit :reindex_jurisdiction_user_size,
               :reindex_jurisdiction_review_manager_email
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
      technical_support: "employee",
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
      %w[
        reviewer
        review_manager
        super_admin
        regional_review_manager
        technical_support
      ]
    when "review_manager", "regional_review_manager", "technical_support"
      %w[reviewer review_manager technical_support regional_review_manager]
    else
      []
    end
  end

  def manager?
    review_manager? || regional_review_manager?
  end

  def member_of?(jurisdiction_id)
    jurisdictions.find_by(id: jurisdiction_id).present?
  end

  def review_staff?
    reviewer? || review_manager? || regional_review_manager?
  end

  def jurisdiction_staff?
    review_staff? || technical_support?
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

  def promotable_to_regional_rm?
    # may double-promote existing RRMs with more jurisdictions
    manager?
  end

  # Override active_for_authentication? to check if the user is discarded
  def active_for_authentication?
    super && !discarded?
  end

  # Provide a specific Devise failure message when a user is archived (discarded)
  def inactive_message
    return :archived if discarded?

    super
  end

  private

  def should_revoke_jwt_allowlist?
    saved_change_to_discarded_at? && discarded_at.present?
  end

  def revoke_jwt_allowlist
    AllowlistedJwt.where(user_id: id).delete_all
  end

  def omniauth_provider_appropriate_for_role
    return unless omniauth_provider.present?

    valid_providers = {
      submitter: %w[bceidbasic bceidbusiness digital-building-permit-5120],
      super_admin: ["idir"],
      reviewer: %w[bceidbasic bceidbusiness],
      review_manager: %w[bceidbasic bceidbusiness],
      regional_review_manager: %w[bceidbasic bceidbusiness],
      technical_support: %w[bceidbasic bceidbusiness]
    }
    return if valid_providers[role.to_sym].include?(omniauth_provider)

    errors.add(:omniauth_provider, "Invalid for role")
  end

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

  def reindex_jurisdiction_review_manager_email
    return unless jurisdictions.any?

    if (
         saved_change_to_role? || destroyed? || new_record? ||
           saved_change_to_email?
       ) && (review_manager? || regional_review_manager?)
      jurisdictions.reindex
    end
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
    if jurisdictions.any?
      unless review_staff? || technical_support?
        errors.add(:jurisdictions, :allowed_roles_only)
      end
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
