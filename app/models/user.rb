class User < ApplicationRecord
  include Devise::JWT::RevocationStrategies::Allowlist

  devise :database_authenticatable,
         :registerable,
         :recoverable,
         :validatable,
         :jwt_cookie_authenticatable,
         :jwt_authenticatable,
         jwt_revocation_strategy: self
end
