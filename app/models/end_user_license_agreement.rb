class EndUserLicenseAgreement < ApplicationRecord
  has_many :user_license_agreements

  before_create :replace_active_agreement, if: :active

  validates_uniqueness_of :active, if: :active

  def self.active_agreement
    find_by(active: true)
  end

  private

  def replace_active_agreement
    EndUserLicenseAgreement.active_agreement&.update(active: false)
  end
end
