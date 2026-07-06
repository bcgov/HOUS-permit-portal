class AddSectionCompletionStatusToPart9StepCodeChecklists < ActiveRecord::Migration[
  7.2
]
  DEFAULT_SECTION_COMPLETION_STATUS = {
    start: {
      complete: false,
      relevant: true
    },
    project_info: {
      complete: false,
      relevant: true
    },
    h2k_import: {
      complete: false,
      relevant: true
    },
    compliance_summary: {
      complete: false,
      relevant: true
    },
    completed_by: {
      complete: false,
      relevant: true
    },
    building_characteristics: {
      complete: false,
      relevant: true
    },
    energy_performance: {
      complete: false,
      relevant: true
    },
    energy_step_compliance: {
      complete: false,
      relevant: true
    },
    zero_carbon_compliance: {
      complete: false,
      relevant: true
    },
    review: {
      complete: false,
      relevant: true
    },
    report: {
      complete: false,
      relevant: true
    }
  }.freeze

  def change
    add_column :part_9_step_code_checklists,
               :section_completion_status,
               :jsonb,
               default: DEFAULT_SECTION_COMPLETION_STATUS,
               null: false
  end
end
