class JurisdictionMembership < ApplicationRecord
  belongs_to :jurisdiction
  belongs_to :user
end
