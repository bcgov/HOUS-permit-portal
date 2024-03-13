class UserLicenseAgreement < ApplicationRecord
  belongs_to :user
  belongs_to :agreement, class_name: "EndUserLicenseAgreement"

  validates :accepted_at, presence: true

  def self.active_agreement
    where(agreement_id: EndUserLicenseAgreement.active_agreement.id)
  end
end
