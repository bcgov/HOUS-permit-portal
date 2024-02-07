class CreateStepCodeDataEntries < ActiveRecord::Migration[7.1]
  def change
    create_table :step_code_data_entries, id: :uuid do |t|
      t.references :step_code, foreign_key: :true, type: :uuid
      t.integer :stage, null: false

      t.string :model
      t.string :version
      t.string :weather_location
      t.decimal :fwdr
      t.string :p_file_no
      t.decimal :above_grade_heated_floor_area
      t.decimal :below_grade_heated_floor_area
      t.integer :dwelling_units_count
      t.decimal :baseloads
      t.integer :hdd
      t.decimal :aec
      t.decimal :ref_aec
      t.decimal :building_envelope_surface_area
      t.decimal :building_volume
      t.decimal :ach
      t.decimal :nla
      t.decimal :aux_energy_required
      t.decimal :proposed_gshl
      t.decimal :ref_gshl
      t.decimal :design_cooling_load
      t.decimal :ac_cooling_capacity
      t.decimal :air_heat_pump_cooling_capacity
      t.decimal :grounded_heat_pump_cooling_capacity
      t.decimal :water_heat_pump_cooling_capacity
      t.decimal :heating_furnace
      t.decimal :heating_boiler
      t.decimal :heating_combo
      t.decimal :electrical_consumption
      t.decimal :natural_gas_consumption
      t.decimal :propane_consumption
      t.decimal :district_energy_consumption
      t.decimal :district_energy_ef
      t.decimal :other_ghg_consumption
      t.decimal :other_ghg_ef
      t.decimal :hot_water
      t.decimal :cooking
      t.decimal :laundry
      t.timestamps
    end
  end
end
