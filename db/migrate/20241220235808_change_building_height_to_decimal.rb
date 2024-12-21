class ChangeBuildingHeightToDecimal < ActiveRecord::Migration[7.1]
  def up
    change_column :part_3_step_code_checklists, :building_height, :decimal
  end

  def down
    change_column :part_3_step_code_checklists, :building_height, :integer
  end
end
