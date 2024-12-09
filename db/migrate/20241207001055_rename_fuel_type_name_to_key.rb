class RenameFuelTypeNameToKey < ActiveRecord::Migration[7.1]
  def change
    remove_column :fuel_types, :name, :string
    add_column :fuel_types, :key, :integer
  end
end
