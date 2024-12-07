class Part3StepCode::Checklist < ApplicationRecord
  self.table_name = "part_3_step_code_checklists"

  belongs_to :step_code, optional: true

  has_many :occupancy_classifications, dependent: :destroy
  has_many :baseline_occupancies,
           -> { where(occupancy_type: :baseline) },
           class_name: "Part3StepCode::OccupancyClassification"
  accepts_nested_attributes_for :baseline_occupancies, allow_destroy: true
  has_many :step_code_occupancies,
           -> { where(occupancy_type: :step_code) },
           class_name: "Part3StepCode::OccupancyClassification"
  accepts_nested_attributes_for :step_code_occupancies, allow_destroy: true

  has_many :fuel_types
  accepts_nested_attributes_for :fuel_types, allow_destroy: true

  has_many :make_up_air_fuels
  has_many :document_references
  has_many :reference_energy_outputs,
           -> { where(source: :reference) },
           class_name: "Part3StepCode::EnergyOutput"
  has_many :modelled_energy_outputs,
           -> { where(source: :modelled) },
           class_name: "Part3StepCode::EnergyOutput"

  delegate :building_permit_number,
           :nickname,
           :jurisdiction_name,
           :full_address,
           :pid,
           :status,
           :newly_submitted_at,
           to: :step_code

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
         district_system
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

  enum climate_zone: %i[zone_4 zone_5 zone_6 zone_7a zone_7b zone_8]

  def compliance_metrics
    if occupancy_classifications.step_code_occupancy.any?
      %i[teui tedi ghgi]
    else
      [:total_energy]
    end
  end

  def heating_degree_days
    self[:heating_degree_days].presence ||
      step_code.jurisdiction_heating_degree_days
  end
end
