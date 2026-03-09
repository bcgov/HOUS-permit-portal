class Part3OccupancyRequiredStep < ApplicationRecord
  belongs_to :jurisdiction

  CONFIGURABLE_OCCUPANCY_KEYS = %w[
    hotels_and_motels
    other_residential_occupancies
    offices
    other_personal_services
    mercantile_occupancies
  ].freeze

  validates :occupancy_key,
            presence: true,
            inclusion: {
              in: CONFIGURABLE_OCCUPANCY_KEYS
            }
  validates :energy_step_required,
            presence: true,
            numericality: {
              greater_than_or_equal_to: 2,
              less_than_or_equal_to: 4
            }
  validates :zero_carbon_step_required,
            numericality: {
              greater_than_or_equal_to: 1,
              less_than_or_equal_to: 4
            },
            allow_nil: true
end
