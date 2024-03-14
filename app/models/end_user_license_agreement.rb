class EndUserLicenseAgreement < ApplicationRecord
  has_many :user_license_agreements

  before_create :replace_active_agreement, if: :active

  def self.active_agreement
    find_by(active: true)
  end

  private

  def replace_active_agreement
    EndUserLicenseAgreement.where(active: true).update_all(active: false)
  end
end
