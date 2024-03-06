class AddCodecoToStepCodeChecklists < ActiveRecord::Migration[7.1]
  def change
    add_column :step_code_checklists, :codeco, :boolean
  end
end
