class RemoveNameFromStepCodes < ActiveRecord::Migration[7.1]
  def change
    remove_column :step_codes, :name, :string
  end
end
