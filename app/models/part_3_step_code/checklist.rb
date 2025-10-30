class Part3StepCode::Checklist < ActiveRecord::Base
  self.table_name = "part_3_step_code_checklists"

  include ChecklistReportDocumentConcern

  delegate :newly_submitted_at,
           :reference_number,
           :discarded?,
           to: :step_code,
           allow_nil: true

  delegate :permit_application_id, to: :step_code

  belongs_to :step_code,
             optional: true,
             class_name: "Part3StepCode",
             foreign_key: "step_code_id",
             inverse_of: :checklist,
             touch: true

  accepts_nested_attributes_for :step_code, update_only: true

  has_many :occupancy_classifications, dependent: :destroy
  has_many :baseline_occupancies,
           -> { where(occupancy_type: :baseline) },
           class_name: "Part3StepCode::OccupancyClassification"
  accepts_nested_attributes_for :baseline_occupancies, allow_destroy: true
  has_many :step_code_occupancies,
           -> { where(occupancy_type: :step_code) },
           class_name: "Part3StepCode::OccupancyClassification"
  accepts_nested_attributes_for :step_code_occupancies, allow_destroy: true

  has_many :fuel_types, dependent: :destroy
  accepts_nested_attributes_for :fuel_types, allow_destroy: true

  has_many :make_up_air_fuels, dependent: :destroy
  accepts_nested_attributes_for :make_up_air_fuels, allow_destroy: true

  has_many :document_references, dependent: :destroy
  has_many :reference_energy_outputs,
           -> { where(source: :reference) },
           class_name: "Part3StepCode::EnergyOutput",
           dependent: :destroy
  accepts_nested_attributes_for :reference_energy_outputs
  accepts_nested_attributes_for :document_references, allow_destroy: true

  has_many :modelled_energy_outputs,
           -> { where(source: :modelled) },
           class_name: "Part3StepCode::EnergyOutput",
           dependent: :destroy
  accepts_nested_attributes_for :modelled_energy_outputs, allow_destroy: true

  enum :building_code_version,
       %i[revision_1 revision_2 revision_3 revision_4 revision_5],
       default: "BCBC 2018 Revision 5"

  enum :is_suite_sub_metered, %i[yes no not_applicable]

  enum :software,
       %i[
         ies_ve
         energy_plus
         design_builder
         open_studio
         e_quest
         doe_2_other
         phpp
         other
       ],
       prefix: :software

  enum :heating_system_plant,
       %i[
         none
         air_source_heat_pump
         ground_source_heat_pump
         air_source_vrf
         ground_source_vrf
         gas_boiler
         district_system
         other
       ],
       prefix: :heating_plant

  enum :heating_system_type,
       %i[
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
       prefix: :heating_type

  enum :cooling_system_plant,
       %i[
         none
         air_cooled_chiller
         water_cooled_chiller
         air_source_heat_pump
         ground_source_heat_pump
         air_source_vrf
         ground_source_vrf
         other
       ],
       prefix: :cooling_plant

  enum :cooling_system_type,
       %i[
         ptac
         hydronic_fan_coils
         hydronic_baseboards
         vrf_units
         radiant_floor_ceiling
         none
         other
       ],
       prefix: :cooling_type

  enum :dhw_system_type,
       %i[
         heat_pump_space_heating
         air_source_heat_pump
         ground_source_heat_pump
         gas_space_heating
         gas
         suite_electric
         suite_gas
         other
       ],
       prefix: :dhw

  enum :climate_zone, %i[zone_4 zone_5 zone_6 zone_7a zone_7b zone_8]

  validates :heating_system_plant_description,
            presence: true,
            if: :heating_plant_other?
  validates :cooling_system_plant_description,
            presence: true,
            if: :cooling_plant_other?
  validates :heating_system_type_description,
            presence: true,
            if: :heating_type_other?
  validates :cooling_system_type_description,
            presence: true,
            if: :cooling_type_other?
  validates :dhw_system_description, presence: true, if: :dhw_other?
  validates :completed_by_email,
            format: {
              with: URI::MailTo::EMAIL_REGEXP
            },
            allow_blank: true

  before_create :set_climate_info

  def compliance_metrics
    if occupancy_classifications.step_code_occupancy.any?
      %i[teui tedi ghgi]
    else
      [:total_energy]
    end
  end

  def total_occupancy_floor_area
    occupancy_classifications.sum(:modelled_floor_area) || 0
  end

  def total_step_code_occupancy_floor_area
    step_code_occupancies.sum(:modelled_floor_area) || 0
  end

  def compliance_report
    StepCode::Part3::V1::GenerateReport.new(checklist: self).call
  end

  def complete?
    section_completion_status.dig("step_code_summary", "complete")
  end

  private

  def set_climate_info
    return unless step_code&.permit_application

    self.heating_degree_days ||= step_code.jurisdiction_heating_degree_days
    self.climate_zone ||=
      StepCode::Part3::V0::Requirements::References::ClimateZone.value(
        step_code.jurisdiction_heating_degree_days
      )
  end
end
