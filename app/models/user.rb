class User < ApplicationRecord
  # Include default devise modules. Others available are:
  # :confirmable, :lockable, :timeoutable, :trackable and :omniauthable
  devise :invitable, :database_authenticatable, :registerable, :recoverable, :rememberable, :validatable
  include Devise::JWT::RevocationStrategies::Allowlist

  validate :jurisdiction_must_belong_to_correct_roles
  validates :username, presence: true

  devise :invitable,
         :database_authenticatable,
         :confirmable,
         :registerable,
         :recoverable,
         :validatable,
         :timeoutable,
         :jwt_cookie_authenticatable,
         :jwt_authenticatable,
         jwt_revocation_strategy: self

  enum role: { submitter: 0, review_manager: 1, reviewer: 2, super_admin: 3 }, _default: 0

  # Associations
  has_many :permit_applications, foreign_key: "submitter_id"
  has_many :applied_jurisdictions, through: :permit_applications, source: :jurisdiction

  belongs_to :jurisdiction, optional: true

  def self.invitable_roles
    %w[reviewer review_manager]
  end

  private

  def jurisdiction_must_belong_to_correct_roles
    if jurisdiction.present? && !reviewer? && !review_manager?
      errors.add(:jurisdiction, "Cannot be present when user is not a reviewer or review manager")
    end
  end
end
