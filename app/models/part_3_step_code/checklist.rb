class Part3StepCode::Checklist < ActiveRecord::Base
  self.table_name = "part_3_step_code_checklists"

  include ChecklistReportDocumentConcern
  include StepCodeChecklistStageCompletion

  SECTION_COMPLETION_STATUS_KEYS = %i[
    start
    project_details
    location_details
    baseline_occupancies
    baseline_details
    district_energy
    fuel_types
    additional_fuel_types
    baseline_performance
    step_code_occupancies
    step_code_performance_requirements
    modelled_outputs
    renewable_energy
    overheating_requirements
    residential_adjustments
    document_references
    performance_characteristics
    hvac
    contact
    requirements_summary
    step_code_summary
    report
  ].freeze

  SECTION_COMPLETION_STATUS_PARAMS =
    SECTION_COMPLETION_STATUS_KEYS.index_with { %i[complete relevant] }.freeze

  DEFAULT_SECTION_COMPLETION_STATUS =
    SECTION_COMPLETION_STATUS_KEYS
      .index_with { { complete: false, relevant: true } }
      .merge(project_details: { complete: false, relevant: false })
      .deep_stringify_keys
      .freeze

  def self.section_completion_status_params
    SECTION_COMPLETION_STATUS_PARAMS
  end

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
             inverse_of: :checklists,
             touch: true

  accepts_nested_attributes_for :step_code, update_only: true

  enum :stage, %i[pre_construction mid_construction as_built]
  enum :status, %i[draft complete], prefix: :status

  validates :stage, uniqueness: { scope: :step_code_id }, if: :step_code_id?

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

  before_validation :set_default_section_completion_status
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
    status_complete?
  end

  private

  def set_climate_info
    return unless step_code&.jurisdiction

    self.heating_degree_days ||=
      step_code.default_jurisdiction_heating_degree_days
    self.climate_zone ||=
      StepCode::Part3::V0::Requirements::References::ClimateZone.value(
        heating_degree_days
      )
  end

  def set_default_section_completion_status
    self.section_completion_status =
      DEFAULT_SECTION_COMPLETION_STATUS.deep_merge(
        section_completion_status.presence || {}
      )
  end
end
