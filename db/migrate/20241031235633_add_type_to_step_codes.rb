class AddTypeToStepCodes < ActiveRecord::Migration[7.1]
  def change
    add_column :step_codes, :type, :string
  end
end
