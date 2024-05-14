class AddStatusToStepCodeChecklists < ActiveRecord::Migration[7.1]
  def change
    add_column :step_code_checklists, :status, :integer, default: 0, null: false
    add_index :step_code_checklists, :status
  end
end
