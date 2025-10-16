class JurisdictionServicePartnerEnrollment < ApplicationRecord
  belongs_to :jurisdiction

  attribute :service_partner, :integer
  enum service_partner: { archistar: 0 }

  validates :jurisdiction_id, uniqueness: { scope: :service_partner }
  validates :service_partner, presence: true
end
