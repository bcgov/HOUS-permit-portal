class User < ApplicationRecord
  searchkick searchable: %i[first_name last_name username email], word_start: %i[first_name last_name]

  scope :review_managers, -> { where(role: User.roles[:review_manager]) }
  scope :reviewers, -> { where(role: User.roles[:reviewer]) }

  # Include default devise modules. Others available are:
  # :confirmable, :lockable, :timeoutable, :trackable and :omniauthable
  devise :invitable, :database_authenticatable, :registerable, :recoverable, :rememberable, :validatable
  include Devise::JWT::RevocationStrategies::Allowlist

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
         omniauth_providers: %i[keycloak],
         jwt_revocation_strategy: self

  enum role: { submitter: 0, review_manager: 1, reviewer: 2, super_admin: 3 }, _default: 0

  # Associations
  belongs_to :jurisdiction, optional: true
  has_many :permit_applications, foreign_key: "submitter_id", dependent: :destroy
  has_many :applied_jurisdictions, through: :permit_applications, source: :jurisdiction

  # Validations
  validate :jurisdiction_must_belong_to_correct_roles
  validate :unique_bceid

  def search_data
    {
      updated_at: updated_at,
      created_at: created_at,
      role: role,
      name: name,
      username: username,
      email: email,
      jurisdiction_id: jurisdiction_id,
      # last_sign_in: "TODO",
    }
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
      username: username,
      email: email,
      jurisdiction_id: jurisdiction_id,
      # last_sign_in: "TODO",
    }
  end

  def name
    "#{first_name} #{last_name}"
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

  private

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
