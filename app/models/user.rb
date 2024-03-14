class User < ApplicationRecord
  searchkick searchable: %i[first_name last_name username email], word_start: %i[first_name last_name]

  scope :review_managers, -> { where(role: User.roles[:review_manager]) }
  scope :reviewers, -> { where(role: User.roles[:reviewer]) }

  # Include default devise modules. Others available are:
  # :confirmable, :lockable, :timeoutable, :trackable and :omniauthable
  devise :invitable, :database_authenticatable, :registerable, :recoverable, :rememberable, :validatable
  include Devise::JWT::RevocationStrategies::Allowlist
  include Discard::Model

  devise :invitable,
         :database_authenticatable,
         :confirmable,
         :registerable,
         :recoverable,
         :rememberable,
         :validatable,
         :timeoutable,
         :jwt_cookie_authenticatable,
         :jwt_authenticatable,
         :omniauthable,
         :trackable,
         omniauth_providers: %i[keycloak],
         jwt_revocation_strategy: self

  enum role: { submitter: 0, review_manager: 1, reviewer: 2, super_admin: 3 }, _default: 0

  # https://github.com/waiting-for-dev/devise-jwt
  self.skip_session_storage = %i[http_auth params_auth]

  # Associations
  belongs_to :jurisdiction, optional: true
  has_many :permit_applications, foreign_key: "submitter_id", dependent: :destroy
  has_many :applied_jurisdictions, through: :permit_applications, source: :jurisdiction

  # Validations
  validate :jurisdiction_must_belong_to_correct_roles
  validate :confirmed_user_has_fields
  validate :unique_bceid
  validates :email, presence: true

  after_commit :refresh_search_index, if: :saved_change_to_discarded_at
  after_commit :reindex_jurisdiction_user_size

  # Stub this for now since we do not want to use IP Tracking at the moment - Jan 30, 2024
  attr_accessor :current_sign_in_ip, :last_sign_in_ip

  def name
    "#{first_name} #{last_name}"
  end

  def search_data
    {
      updated_at: updated_at,
      created_at: created_at,
      role: role,
      first_name: first_name,
      last_name: last_name,
      username: username,
      email: email,
      jurisdiction_id: jurisdiction_id,
      discarded: discarded_at.present?,
      # last_sign_in: "TODO",
    }
  end

  def self.invitable_roles
    %w[reviewer review_manager]
  end

  def self.from_omniauth(auth)
    find_or_create_by(provider: auth.provider, uid: auth.uid) do |user|
      user.email = auth.info.email
      user.password = Devise.friendly_token[0, 20]
    end
  end

  def accept_invitation_with_omniauth(auth)
    update(password: Devise.friendly_token[0, 20], provider: auth.provider, uid: auth.uid)
    accept_invitation! if valid?
  end

  def staff?
    reviewer? || review_manager? || super_admin?
  end

  def review_staff?
    reviewer? || review_manager?
  end

  def role_name
    role.gsub("_", " ")
  end

  private

  def reindex_jurisdiction_user_size
    return unless jurisdiction.present?

    jurisdiction.reindex if saved_change_to_jurisdiction_id? || saved_change_to_role? || destroyed? || new_record?
  end

  def refresh_search_index
    User.search_index.refresh
  end

  def confirmed_user_has_fields
    errors.add(:user, "Confirmed user must have username") unless !confirmed? || username.present?
    errors.add(:user, "Confirmed user must have first_name") unless !confirmed? || first_name.present?
    errors.add(:user, "Confirmed user must have last_name") unless !confirmed? || last_name.present?
  end

  def jurisdiction_must_belong_to_correct_roles
    if jurisdiction.present? && !reviewer? && !review_manager?
      errors.add(:jurisdiction, "Cannot be present when user is not a reviewer or review manager")
    end
  end

  def unique_bceid
    return unless uid.present?
    existing_user = User.where.not(uid: nil).find_by(uid: uid, provider: provider)
    errors.add(:uid, :taken, jurisdiction: existing_user.jurisdiction.name) if existing_user && existing_user != self
  end
end
