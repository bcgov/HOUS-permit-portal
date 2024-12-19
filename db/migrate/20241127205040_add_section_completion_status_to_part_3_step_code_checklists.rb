class AddSectionCompletionStatusToPart3StepCodeChecklists < ActiveRecord::Migration[
  7.1
]
  def change
    add_column :part_3_step_code_checklists, :section_completion_status, :jsonb
  end
end
