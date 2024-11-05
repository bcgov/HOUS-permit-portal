class CreatePart3StepCodeTables < ActiveRecord::Migration[7.1]
  def change
    create_table :part_3_step_code_checklists, id: :uuid do |t|
      t.references :step_code, foreign_key: :true, type: :uuid
      t.decimal :building_height
      t.integer :building_code_version
      t.integer :heating_degree_days
      t.integer :climate_zone
      t.decimal :ref_annual_thermal_energy_demand
      t.decimal :total_annual_thermal_energy_demand
      t.decimal :total_annual_cooling_energy_demand
      t.decimal :step_code_annual_thermal_energy_demand
      t.decimal :generated_electricity
      t.decimal :overheating_hours
      t.integer :pressurized_doors_count
      t.decimal :pressurization_airflow_per_door
      t.decimal :pressurized_cooridors_area
      t.decimal :suite_heating_energy
      t.integer :software
      t.string :software_name
      t.string :simulation_weather_file
      t.decimal :above_grade_wall_area
      t.decimal :window_to_wall_area_ratio
      t.decimal :vertical_facade_to_floor_area_ratio
      t.decimal :window_to_floor_area_ratio
      t.decimal :design_airtightness
      t.decimal :tested_airtightness
      t.decimal :modelled_infiltration_rate
      t.decimal :as_built_infiltration_rate
      t.decimal :average_wall_clear_field_r_value
      t.decimal :average_wall_effective_r_value
      t.decimal :average_roof_clear_field_r_value
      t.decimal :average_roof_effective_r_value
      t.decimal :average_window_effective_u_value
      t.decimal :average_window_solar_heat_gain_coefficient
      t.decimal :average_occupant_density
      t.decimal :average_lighting_power_density
      t.decimal :average_ventilation_rate
      t.decimal :dhw_low_flow_savings
      t.boolean :is_demand_control_ventilation_used
      t.decimal :sensible_recovery_efficient
      t.integer :heating_system_plant
      t.integer :heating_system_type
      t.string :heating_system_description
      t.integer :cooling_system_plant
      t.integer :cooling_system_type
      t.string :cooling_system_description
      t.integer :dhw_system_type
      t.string :dhw_system_description
      t.string :completed_by_name
      t.string :completed_by_title
      t.string :completed_by_phone_number
      t.string :completed_by_email
      t.string :completed_by_organization_name
      t.string :submitted_at

      t.timestamps
    end

    create_table :occupancy_classifications, id: :uuid do |t|
      t.references :checklist,
                   foreign_key: {
                     to_table: :part_3_step_code_checklists
                   },
                   type: :uuid
      t.integer :key
      t.decimal :modelled_floor_area
      t.integer :performance_requirement
      t.decimal :percent_better_requirement
      t.integer :energy_step_required
      t.integer :zero_carbon_step_required
      t.string :requirement_source
      t.integer :occupancy_type

      t.timestamps
    end

    create_table :fuel_types, id: :uuid do |t|
      t.references :checklist,
                   foreign_key: {
                     to_table: :part_3_step_code_checklists
                   },
                   type: :uuid
      t.string :name
      t.string :description
      t.decimal :emissions_factor
      t.string :source
      t.decimal :ref_annual_energy

      t.timestamps
    end

    create_table :make_up_air_fuels, id: :uuid do |t|
      t.references :fuel_type, index: true, type: :uuid
      t.references :checklist,
                   foreign_key: {
                     to_table: :part_3_step_code_checklists
                   },
                   type: :uuid
      t.decimal :percent_of_load

      t.timestamps
    end

    create_table :energy_outputs, id: :uuid do |t|
      t.references :fuel_type, index: true, type: :uuid
      t.references :checklist,
                   foreign_key: {
                     to_table: :part_3_step_code_checklists
                   },
                   type: :uuid
      t.integer :source
      t.string :name
      t.decimal :annual_energy

      t.timestamps
    end

    create_table :document_references, id: :uuid do |t|
      t.references :checklist,
                   foreign_key: {
                     to_table: :part_3_step_code_checklists
                   },
                   type: :uuid
      t.string :name
      t.string :document_name
      t.datetime :date_issued
      t.string :prepared_by

      t.timestamps
    end
  end
end
