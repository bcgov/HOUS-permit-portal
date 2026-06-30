class Part9StepCode::Checklist < ActiveRecord::Base
  self.table_name = "part_9_step_code_checklists"

  include ChecklistReportDocumentConcern

  SECTION_COMPLETION_STATUS_KEYS = %i[
    start
    project_info
    h2k_import
    compliance_summary
    completed_by
    building_characteristics
    energy_performance
    energy_step_compliance
    zero_carbon_compliance
    review
    report
  ].freeze

  SECTION_COMPLETION_STATUS_PARAMS =
    SECTION_COMPLETION_STATUS_KEYS.index_with { %i[complete relevant] }.freeze

  DEFAULT_SECTION_COMPLETION_STATUS =
    SECTION_COMPLETION_STATUS_KEYS
      .index_with { { complete: false, relevant: true } }
      .merge(project_info: { complete: false, relevant: false })
      .deep_stringify_keys
      .freeze

  def self.section_completion_status_params
    SECTION_COMPLETION_STATUS_PARAMS
  end

  delegate :permit_application_id, to: :step_code, allow_nil: true

  belongs_to :step_code,
             optional: true,
             class_name: "Part9StepCode",
             foreign_key: :step_code_id,
             inverse_of: :checklists,
             touch: true

  belongs_to :step_requirement,
             class_name: "JurisdictionStepRequirement",
             optional: true

  has_many :data_entries,
           class_name: "Part9StepCode::DataEntry",
           dependent: :destroy
  accepts_nested_attributes_for :data_entries, allow_destroy: true
  has_one :building_characteristics_summary,
          class_name: "Part9StepCode::BuildingCharacteristicsSummary",
          foreign_key: "checklist_id",
          dependent: :destroy
  accepts_nested_attributes_for :building_characteristics_summary
  after_create :create_building_characteristics_summary
  before_validation :set_default_section_completion_status

  COMPLIANCE_PATH_REQUIRED_CHANGES = %w[
    compliance_path
    hvac_consumption
    dwh_heating_consumption
    ref_hvac_consumption
    ref_dwh_heating_consumption
    epc_calculation_airtightness
    epc_calculation_testing_target_type
    epc_calculation_compliance
  ].freeze

  validates :compliance_path, presence: true, if: :requires_compliance_path?
  validates :stage, uniqueness: { scope: :step_code_id }, if: :step_code_id?

  delegate :plan_author, :plan_version, :plan_date, to: :step_code

  delegate :jurisdiction_name, to: :step_code
  delegate :permit_date, to: :step_code
  delegate :title, to: :step_code
  delegate :full_address, to: :step_code
  delegate :pid, to: :step_code
  delegate :reference_number, to: :step_code
  delegate :permit_application_number, to: :step_code
  delegate :discarded?, to: :step_code

  enum :stage, %i[pre_construction mid_construction as_built]
  enum :status, %i[draft complete]
  enum :compliance_path,
       %i[step_code_ers step_code_necb passive_house step_code]
  enum :epc_calculation_airtightness, %i[two_point_five three_point_two]
  enum :epc_calculation_testing_target_type, %i[ach nlr nla]
  enum :building_type,
       %i[
         laneway
         single_detached
         double_detached
         row
         multi_plex
         single_detached_with_suite
         low_rise_murb
         stacked_duplex
         triplex
         retail
         other
       ]

  def self.select_options
    {
      compliance_paths: compliance_paths.keys,
      airtightness_values: epc_calculation_airtightnesses.keys,
      epc_testing_target_types: epc_calculation_testing_target_types.keys,
      building_types: building_types.keys,
      energy_steps:
        (
          ENV["PART_9_MIN_ENERGY_STEP"].to_i..ENV["PART_9_MAX_ENERGY_STEP"].to_i
        ).to_a,
      zero_carbon_steps:
        (
          ENV["PART_9_MIN_ZERO_CARBON_STEP"].to_i..ENV[
            "PART_9_MAX_ZERO_CARBON_STEP"
          ].to_i
        ).to_a,
      building_characteristics_summary: {
        performance_types: {
          windows_glazed_doors:
            StepCode::BuildingCharacteristics::WindowsGlazedDoors::PERFORMANCE_TYPES.keys,
          doors:
            StepCode::BuildingCharacteristics::Line::Doors::PERFORMANCE_TYPES.keys,
          space_heating_cooling:
            StepCode::BuildingCharacteristics::Line::SpaceHeatingCooling::PERFORMANCE_TYPES.keys,
          hot_water:
            StepCode::BuildingCharacteristics::Line::HotWater::PERFORMANCE_TYPES.keys
        },
        fossil_fuels_presence:
          StepCode::BuildingCharacteristics::FossilFuels::PRESENCE.keys
      }
    }
  end

  def compliance_reports
    return [] if data_entries.none?

    reports =
      StepCode::Compliance::GenerateReports
        .new(checklist: self, requirements: step_code.step_requirements)
        .call
        .reports
    reports
  end

  def passing_compliance_reports
    compliance_reports.filter { |r| r[:energy].step && r[:zero_carbon].step }
  end

  def selected_report
    return unless step_requirement.present?

    reports = compliance_reports
    reports.find { |r| r[:requirement_id] == step_requirement_id }
  end

  def complete?
    status == "complete"
  end

  private

  def requires_compliance_path?
    COMPLIANCE_PATH_REQUIRED_CHANGES.any? do |attribute|
      will_save_change_to_attribute?(attribute)
    end
  end

  def set_default_section_completion_status
    self.section_completion_status =
      DEFAULT_SECTION_COMPLETION_STATUS.deep_merge(
        section_completion_status.presence || {}
      )
  end
end
