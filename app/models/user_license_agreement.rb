class UserLicenseAgreement < ApplicationRecord
  belongs_to :user
  belongs_to :agreement, class_name: "EndUserLicenseAgreement"

  validates :accepted_at, presence: true
  validate :user_eula_variant_matches_agreement_variant

  def self.active_agreement(variant)
    where(agreement_id: EndUserLicenseAgreement.active_agreement(variant).id)
  end

  private

  def user_eula_variant_matches_agreement_variant
    return if user.blank? || agreement.blank?

    unless user.eula_variant == agreement.variant
      errors.add(:agreement, "variant must match user's eula_variant")
    end
  end
end
