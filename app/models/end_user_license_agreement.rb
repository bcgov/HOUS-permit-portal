class EndUserLicenseAgreement < ApplicationRecord
  has_many :user_license_agreements

  before_create :replace_active_agreement, if: :active

  enum variant: { open: 0, employee: 1 }, _default: 0

  def self.active_agreement(variant)
    find_by(active: true, variant: variant)
  end

  private

  def replace_active_agreement
    EndUserLicenseAgreement.where(active: true, variant: variant).update_all(active: false)
  end
end
