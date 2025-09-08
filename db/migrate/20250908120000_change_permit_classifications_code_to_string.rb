class ChangePermitClassificationsCodeToString < ActiveRecord::Migration[7.1]
  def up
    add_column :permit_classifications, :code_string, :string

    execute <<-SQL
      UPDATE permit_classifications
      SET code_string = CASE code
        WHEN 0 THEN 'low_residential'
        WHEN 1 THEN 'medium_residential'
        WHEN 2 THEN 'high_residential'
        WHEN 3 THEN 'new_construction'
        WHEN 4 THEN 'addition_alteration_renovation'
        WHEN 5 THEN 'site_alteration'
        WHEN 6 THEN 'demolition'
        WHEN 7 THEN 'manufactured_home'
        WHEN 8 THEN 'mechanical'
        WHEN 9 THEN 'plumbing'
        WHEN 10 THEN 'electrical'
        WHEN 11 THEN 'gas'
        WHEN 12 THEN 'solid_fuel_burning_appliance'
        WHEN 13 THEN 'fire_alarm'
        WHEN 14 THEN 'fire_suppression'
        WHEN 15 THEN 'tree_cutting_and_tree_removal'
        WHEN 16 THEN 'retaining_wall'
        WHEN 17 THEN 'relocation'
      END
    SQL

    rename_column :permit_classifications, :code, :code_integer
    rename_column :permit_classifications, :code_string, :code
    remove_column :permit_classifications, :code_integer

    add_index :permit_classifications, :code, unique: true
  end

  def down
    if index_exists?(:permit_classifications, :code)
      remove_index :permit_classifications, column: :code
    end

    add_column :permit_classifications, :code_integer, :integer

    execute <<-SQL
      UPDATE permit_classifications
      SET code_integer = CASE code
        WHEN 'low_residential' THEN 0
        WHEN 'medium_residential' THEN 1
        WHEN 'high_residential' THEN 2
        WHEN 'new_construction' THEN 3
        WHEN 'addition_alteration_renovation' THEN 4
        WHEN 'site_alteration' THEN 5
        WHEN 'demolition' THEN 6
        WHEN 'manufactured_home' THEN 7
        WHEN 'mechanical' THEN 8
        WHEN 'plumbing' THEN 9
        WHEN 'electrical' THEN 10
        WHEN 'gas' THEN 11
        WHEN 'solid_fuel_burning_appliance' THEN 12
        WHEN 'fire_alarm' THEN 13
        WHEN 'fire_suppression' THEN 14
        WHEN 'tree_cutting_and_tree_removal' THEN 15
        WHEN 'retaining_wall' THEN 16
        WHEN 'relocation' THEN 17
      END
    SQL

    rename_column :permit_classifications, :code, :code_string
    rename_column :permit_classifications, :code_integer, :code
    remove_column :permit_classifications, :code_string
  end
end
