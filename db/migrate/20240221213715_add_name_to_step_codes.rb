class AddNameToStepCodes < ActiveRecord::Migration[7.1]
  def change
    add_column :step_codes, :name, :string, null: false
  end
end
