class Part3StepCode::EnergyOutput < ApplicationRecord
  self.table_name = "energy_outputs"

  belongs_to :checklist, touch: true
  belongs_to :fuel_type

  # Validate name presence for 'other' type and ensure it's name is unique within the checklist
  # This is because 'other' energy outputs are user defined
  validates :name, presence: true, if: -> { other? }
  validates :name, uniqueness: { scope: :checklist_id }, if: -> { other? }

  # Validate use_type uniqueness within checklist, except for 'other' use type as it's user defined
  # and it's uniqueness is determined by the name instead of the use_type
  validates :use_type,
            presence: true,
            uniqueness: {
              scope: %i[checklist_id source]
            },
            if: :modelled?,
            unless: :other?

  before_validation :nil_use_type_for_reference

  enum source: %i[modelled reference]
  enum use_type: {
         interior_lighting: 0,
         exterior_lighting: 1,
         heating_general: 2,
         cooling: 3,
         pumps: 4,
         fans: 5,
         domestic_hot_water: 6,
         plug_loads: 7,
         other: 8
       }

  def nil_use_type_for_reference
    self.use_type = nil if reference?
  end
end
