class Part3StepCode::FuelType < ApplicationRecord
  self.table_name = "fuel_types"

  belongs_to :checklist

  enum key: {
         electricity: 0,
         natural_gas: 1,
         district_energy: 2,
         propane: 3,
         light_fuel_oil: 4,
         heavy_fuel_oil: 5,
         diesel_fuel: 6,
         wood_fuel: 7,
         other: 4
       },
       _suffix: :fuel_type

  validates :key,
            presence: true,
            uniqueness: {
              scope: :checklist_id
            },
            unless: :other_fuel_type?
end
