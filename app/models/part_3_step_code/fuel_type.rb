class Part3StepCode::FuelType < ApplicationRecord
  self.table_name = "fuel_types"

  DEFAULTS = [
    { key: :electricity, emissions_factor: 0.011 },
    { key: :natural_gas, emissions_factor: 0.180 }
  ]

  # TODO: EFs are stubbed - replace with actual values
  UNCOMMON = [
    { key: :propane, emissions_factor: 0.130 },
    { key: :light_fuel_oil, emissions_factor: 0.140 },
    { key: :heavy_fuel_oil, emissions_factor: 0.150 },
    { key: :diesel_fuel, emissions_factor: 0.160 },
    { key: :wood_fuel, emissions_factor: 0.170 }
  ]

  scope :defaults, -> { where(key: DEFAULTS.pluck(:key)) }

  before_create :set_emissions_factor

  belongs_to :checklist, optional: true

  enum key: {
         electricity: 0,
         natural_gas: 1,
         district_energy: 2,
         propane: 3,
         light_fuel_oil: 4,
         heavy_fuel_oil: 5,
         diesel_fuel: 6,
         wood_fuel: 7,
         other: 8
       },
       _suffix: :fuel_type

  validates :key,
            presence: true,
            uniqueness: {
              scope: :checklist_id
            },
            unless: :other_fuel_type?

  private

  def set_emissions_factor
    self.emissions_factor ||=
      UNCOMMON.find { |ft| ft[:key] == key }&.dig(:emissions_factor)
  end
end
