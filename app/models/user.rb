class User < ApplicationRecord
  searchkick searchable: %i[first_name last_name username email], word_start: %i[first_name last_name]

  # Include default devise modules. Others available are:
  # :confirmable, :lockable, :timeoutable, :trackable and :omniauthable
  devise :invitable, :database_authenticatable, :registerable, :recoverable, :rememberable, :validatable
  include Devise::JWT::RevocationStrategies::Allowlist

  validate :jurisdiction_must_belong_to_correct_roles

  devise :invitable,
         :database_authenticatable,
         :confirmable,
         :registerable,
         :recoverable,
         :validatable,
         :timeoutable,
         :jwt_cookie_authenticatable,
         :jwt_authenticatable,
         :omniauthable,
         omniauth_providers: %i[keycloakopenid],
         jwt_revocation_strategy: self

  enum role: { submitter: 0, review_manager: 1, reviewer: 2, super_admin: 3 }, _default: 0

  # Associations
  has_many :permit_applications, foreign_key: "submitter_id"
  has_many :applied_jurisdictions, through: :permit_applications, source: :jurisdiction

  belongs_to :jurisdiction, optional: true

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

  private

  def jurisdiction_must_belong_to_correct_roles
    if jurisdiction.present? && !reviewer? && !review_manager?
      errors.add(:jurisdiction, "Cannot be present when user is not a reviewer or review manager")
    end
  end
end
