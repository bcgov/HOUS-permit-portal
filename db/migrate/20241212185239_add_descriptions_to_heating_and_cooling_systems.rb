class AddDescriptionsToHeatingAndCoolingSystems < ActiveRecord::Migration[7.1]
  def change
    add_column :part_3_step_code_checklists,
               :heating_system_plant_description,
               :string,
               null: true
    rename_column :part_3_step_code_checklists,
                  :heating_system_description,
                  :heating_system_type_description

    add_column :part_3_step_code_checklists,
               :cooling_system_plant_description,
               :string,
               null: true
    rename_column :part_3_step_code_checklists,
                  :cooling_system_description,
                  :cooling_system_type_description
  end
end
