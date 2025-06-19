class RenameFuelTypeNameToKey < ActiveRecord::Migration[7.1]
  def up
    add_column :fuel_types, :key, :integer
    # Data migration could go here to preserve data from the :name column
    remove_column :fuel_types, :name, :string
  end

  def down
    add_column :fuel_types, :name, :string
    # Data migration could go here to restore data from the :key column
    remove_column :fuel_types, :key
  end
end
