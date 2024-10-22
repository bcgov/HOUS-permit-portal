class AddPermitTypeRequirementToStepCodeChecklist < ActiveRecord::Migration[7.1]
  def change
    add_reference :step_code_checklists,
                  :step_requirement,
                  null: true,
                  foreign_key: {
                    to_table: :permit_type_required_steps
                  },
                  type: :uuid
  end
end
