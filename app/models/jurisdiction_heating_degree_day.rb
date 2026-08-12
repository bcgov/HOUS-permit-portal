class JurisdictionHeatingDegreeDay < ApplicationRecord
  belongs_to :jurisdiction

  before_validation :normalize_location_name

  validates :location_name,
            presence: true,
            uniqueness: {
              scope: :jurisdiction_id,
              case_sensitive: false
            }
  validates :heating_degree_days,
            presence: true,
            numericality: {
              greater_than: 0,
              less_than_or_equal_to: 10_000
            }

  def climate_zone
    StepCode::Part3::V0::Requirements::References::ClimateZone.value(
      heating_degree_days
    )
  end

  private

  def normalize_location_name
    self.location_name = location_name&.strip
  end
end
