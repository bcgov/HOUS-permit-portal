class Part9StepCode::Checklist < ApplicationRecord
  self.table_name = "part_9_step_code_checklists"

  belongs_to :step_code, optional: Rails.env.test?
  belongs_to :step_requirement,
             class_name: "PermitTypeRequiredStep",
             optional: true

  has_many :data_entries,
           class_name: "Part9StepCode::DataEntry",
           dependent: :destroy
  accepts_nested_attributes_for :data_entries
  has_one :building_characteristics_summary,
          class_name: "Part9StepCode::BuildingCharacteristicsSummary",
          foreign_key: "checklist_id",
          dependent: :destroy
  accepts_nested_attributes_for :building_characteristics_summary
  after_create :create_building_characteristics_summary

  delegate :building_permit_number,
           :jurisdiction_name,
           :full_address,
           :pid,
           to: :step_code
  delegate :plan_author, :plan_version, :plan_date, to: :step_code

  enum stage: %i[pre_construction mid_construction as_built]
  enum status: %i[draft complete]
  enum compliance_path: %i[step_code_ers step_code_necb passive_house step_code]
  enum epc_calculation_airtightness: %i[two_point_five three_point_two]
  enum epc_calculation_testing_target_type: %i[ach nlr nla]
  enum building_type: %i[
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
        (ENV["MIN_ENERGY_STEP"].to_i..ENV["MAX_ENERGY_STEP"].to_i).to_a,
      zero_carbon_steps:
        (
          ENV["MIN_ZERO_CARBON_STEP"].to_i..ENV["MAX_ZERO_CARBON_STEP"].to_i
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
    StepCode::Compliance::GenerateReports
      .new(checklist: self, requirements: step_code.step_requirements)
      .call
      .reports
  end

  def passing_compliance_reports
    compliance_reports.filter { |r| r[:energy].step && r[:zero_carbon].step }
  end

  def selected_report
    return unless step_requirement.present?

    compliance_reports.find { |r| r[:requirement_id] == step_requirement_id }
  end
end
