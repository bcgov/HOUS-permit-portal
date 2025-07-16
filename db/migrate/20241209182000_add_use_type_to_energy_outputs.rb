class AddUseTypeToEnergyOutputs < ActiveRecord::Migration[7.1]
  def change
    add_column :energy_outputs, :use_type, :integer, default: 0
    add_index :energy_outputs, :use_type
  end
end
