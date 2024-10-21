class EndUserLicenseAgreement < ApplicationRecord
  include HtmlSanitizeAttributes

  sanitizable :content

  has_many :user_license_agreements

  after_create :replace_active_agreement, if: :active

  enum variant: { open: 0, employee: 1 }, _default: 0

  validates :active, uniqueness: { scope: :variant }, if: :active?, on: :update

  def self.active_agreement(variant)
    find_by(active: true, variant: variant)
  end

  private

  def replace_active_agreement
    EndUserLicenseAgreement
      .where(active: true, variant: variant)
      .where.not(id: id)
      .update_all(active: false)
  end
end
