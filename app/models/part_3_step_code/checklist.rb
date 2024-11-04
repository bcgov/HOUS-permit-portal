class Part3StepCode::Checklist < ApplicationRecord
  self.table_name = "part_3_step_code_checklists"

  belongs_to :step_code, optional: true

  has_many :occupancy_classifications
  has_many :fuel_types
  has_many :make_up_air_fuels
  has_many :document_references
  has_many :reference_energy_outputs,
           -> { where(source: :reference) },
           class_name: "Part3StepCode::EnergyOutput"
  has_many :modelled_energy_outputs,
           -> { where(source: :modelled) },
           class_name: "Part3StepCode::EnergyOutput"

  enum building_code_version: %i[
         revision_1
         revision_2
         revision_3
         revision_4
         revision_5
       ],
       _default: "BCBC 2018 Revision 5"

  enum software: %i[
         ies_ve
         energy_plus
         design_builder
         open_studio
         e_quest
         doe_2_other
         phpp
         other
       ],
       _prefix: :software

  enum heating_system_plant: %i[
         none
         no_central_plant
         air_source_heat_pump
         ground_source_heat_pump
         air_source_vrf
         ground_source_vrf
         gas_boiler
         district_sytem
         other
       ],
       _prefix: :heating_plant

  enum heating_system_type: %i[
         electric_baseboard
         hydronic_basebaord
         hydronic_fan_coils
         vav_reheat
         air_source_heat_pump
         vrf_units
         radiant_floor_cooling
         gas_fired_rooftop
         electric_resistance_rooftop
         heat_pump_rooftop
         other
       ],
       _prefix: :heating_type

  enum cooling_system_plant: %i[
         none
         air_cooled_chiller
         water_cooled_chiller
         air_source_heat_pump
         ground_source_heat_pump
         air_source_vrf
         ground_source_vrf
         other
       ],
       _prefix: :cooling_plant

  enum cooling_system_type: %i[
         ptac
         hydronic_fan_coils
         hydronic_baseboards
         vrf_units
         radiant_floor_ceiling
         not_applicable
         other
       ],
       _prefix: :cooling_type

  enum dhw_system_type: %i[
         heat_pump_space_heating
         air_source_heat_pump
         ground_source_heat_pump
         gas_space_heating
         gas
         suite_electric
         suite_gas
         other
       ],
       _prefix: :dhw

  enum climate_zone: %i[4 5 6 7a 7b 8]
end
