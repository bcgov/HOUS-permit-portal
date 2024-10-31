module Part3StepCode
  class Checklist < ApplicationRecord
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

    enum building_code_version: {
           revision_1: "BCBC 2018 Revision 1",
           revision_2: "BCBC 2018 Revision 2",
           revision_3: "BCBC 2018 Revision 3",
           revision_4: "BC 2018 Revision 4",
           revision_5: "BCBC 2018 Revision 5"
         },
         _default: "BCBC 2018 Revision 5"

    enum software: {
           ies_ve: "IES-VE",
           energy_plus: "EnergyPlus",
           design_builder: "DesignBuilder",
           open_studio: "OpenStudio",
           e_quest: "eQuest",
           doe_2_other: "DOE-2 Other",
           phpp: "PHPP",
           other: "Other"
         }
    enum heating_system_plant: {
           none: "None",
           no_central_plant: "No Central Plant",
           air_source_heat_pump: "Air Source Heat Pump",
           ground_source_heat_pump: "Ground Source Heat Pump",
           air_source_vrf: "Air Source VRF",
           ground_source_vrf: "Ground Source VRF",
           gas_boiler: "Gas Boiler",
           district_sytem: "District System",
           other: "Other"
         }
    enum heating_system_type: {
           electric_baseboard: "Electric Baseboard",
           hydronic_basebaord: "Hydronic Baseboard",
           hydronic_fan_coils: "Hydronic Fan Coils",
           vav_reheat: "VAV Reheat",
           air_source_heat_pump: "Air Source Heat Pump",
           vrf_units: "VRF Units",
           radiant_floor_cooling: "Radiant Floor/Cooling",
           gas_fired_rooftop: "Gas-fired Rooftop Unit",
           electric_resistance_rooftop: "Electric Resistance Rooftop Unit",
           heat_pump_rooftop: "Heat Pump Rooftop Unit",
           other: "Other"
         }

    enum cooling_system_plant: {
           none: "None",
           air_cooled_chiller: "Air Cooled Chiller",
           water_cooled_chiller: "Water Cooled Chiller",
           air_source_heat_pump: "Air Source Heat Pump",
           ground_source_heat_pump: "Ground Source Heat Pump",
           air_source_vrf: "Air Source VRF",
           ground_source_vrf: "Ground Source VRF",
           other: "Other"
         }

    enum cooling_system_type: {
           ptac: "PTACs",
           hydronic_fan_coils: "Hydronic Fan Coils",
           hydronic_baseboards: "Hydronic Baseboards",
           vrf_units: "VRF Units",
           radiant_floor_ceiling: "Radiant Floor/Ceiling",
           none: "None",
           other: "Other"
         }

    enum dhw_system_type: {
           heat_pump_space_heating: "Heat Pump - Integrated with Space Heating",
           air_source_heat_pump: "Dedicated Heat Pump - Air Source",
           ground_source_heat_pump: "Dedicated Heat Pump - Ground Source",
           gas_space_heating: "Gas - Integrated with Space Heating",
           gas: "Dedicated Gas",
           suite_electric: "Suite Electric",
           suite_gas: "Suite Gas",
           other: "Other"
         }
  end
end
