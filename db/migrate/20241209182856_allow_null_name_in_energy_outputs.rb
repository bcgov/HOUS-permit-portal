class AllowNullNameInEnergyOutputs < ActiveRecord::Migration[7.1]
  def change
    change_column_null :energy_outputs, :name, true
  end
end
