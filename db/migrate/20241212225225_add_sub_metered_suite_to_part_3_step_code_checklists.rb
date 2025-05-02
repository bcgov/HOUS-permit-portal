class AddSubMeteredSuiteToPart3StepCodeChecklists < ActiveRecord::Migration[7.1]
  def change
    add_column :part_3_step_code_checklists, :is_suite_sub_metered, :integer
  end
end
