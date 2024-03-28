class AddBuilderToStepCodeChecklists < ActiveRecord::Migration[7.1]
  def change
    add_column :step_code_checklists, :builder, :string
  end
end
