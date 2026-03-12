class JurisdictionClimateZone < ApplicationRecord
  belongs_to :jurisdiction

  VALID_CLIMATE_ZONES = %w[zone_4 zone_5 zone_6 zone_7a zone_7b zone_8].freeze

  validates :climate_zone,
            presence: true,
            inclusion: {
              in: VALID_CLIMATE_ZONES
            }
  validates :climate_zone, uniqueness: { scope: :jurisdiction_id }
  validates :heating_degree_days,
            numericality: {
              greater_than: 0,
              less_than_or_equal_to: 10_000
            },
            allow_nil: true
end
