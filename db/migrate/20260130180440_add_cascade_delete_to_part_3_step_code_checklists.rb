class AddCascadeDeleteToPart3StepCodeChecklists < ActiveRecord::Migration[7.1]
  def change
    remove_foreign_key :part_3_step_code_checklists, :step_codes
    add_foreign_key :part_3_step_code_checklists,
                    :step_codes,
                    on_delete: :cascade
  end
end
