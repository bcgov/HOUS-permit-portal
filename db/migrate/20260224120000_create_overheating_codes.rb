class CreateOverheatingCodes < ActiveRecord::Migration[7.1]
  def up
    create_table :overheating_codes,
                 id: :uuid,
                 default: -> { "gen_random_uuid()" } do |t|
      t.uuid :creator_id, null: false
      t.integer :status, null: false, default: 0

      # Introduction
      t.string :issued_to
      t.string :project_number

      # Building location
      t.string :full_address
      t.string :pid
      t.uuid :jurisdiction_id
      t.string :building_model
      t.string :site_name
      t.string :lot
      t.string :postal_code

      # Compliance
      t.integer :submittal_type
      t.integer :units

      # Calculations Based On
      t.string :dimensional_info_based_on
      t.integer :attachment
      t.integer :number_of_stories
      t.boolean :has_basement, default: false
      t.string :weather_location # [OVERHEATING TODO] Consider making this a dropdown/enum
      t.boolean :ventilated
      t.boolean :hrv_erv
      t.decimal :ase_percentage, precision: 5, scale: 2
      t.decimal :atre_percentage, precision: 5, scale: 2
      t.integer :front_facing
      t.boolean :front_facing_assumed
      t.integer :air_tightness_category
      t.decimal :air_tightness_ach50, precision: 8, scale: 2
      t.decimal :air_tightness_ela10, precision: 8, scale: 2
      t.boolean :air_tightness_assumed
      t.integer :wind_exposure
      t.integer :wind_sheltering
      t.integer :internal_shading
      t.boolean :internal_shading_assumed
      t.integer :occupants
      t.boolean :occupants_assumed
      t.integer :calculation_units

      # Heating Design Conditions
      t.decimal :heating_outdoor_temp, precision: 5, scale: 1
      t.decimal :heating_indoor_temp, precision: 5, scale: 1
      t.decimal :mean_soil_temp, precision: 5, scale: 1
      t.integer :soil_conductivity
      t.integer :water_table_depth
      t.decimal :slab_fluid_temp, precision: 5, scale: 1

      # Cooling Design Conditions
      t.decimal :cooling_outdoor_temp, precision: 5, scale: 1
      t.decimal :cooling_indoor_temp, precision: 5, scale: 1
      t.decimal :daily_temp_range, precision: 5, scale: 1
      t.decimal :latitude, precision: 6, scale: 2

      # Building Envelope
      t.jsonb :above_grade_walls, default: []
      t.jsonb :below_grade_walls, default: []
      t.jsonb :floors_on_soil, default: []
      t.jsonb :ceilings, default: []
      t.jsonb :exposed_floors, default: []
      t.jsonb :doors, default: []
      t.jsonb :windows, default: []
      t.jsonb :skylights, default: []

      # Heating
      t.decimal :minimum_heating_capacity, precision: 10, scale: 2

      # Cooling
      t.decimal :nominal_cooling_capacity, precision: 10, scale: 2
      t.decimal :minimum_cooling_capacity, precision: 10, scale: 2
      t.decimal :maximum_cooling_capacity, precision: 10, scale: 2

      # Room by Room Results
      t.jsonb :room_results, default: []
      t.decimal :ventilation_loss, precision: 10, scale: 2
      t.decimal :latent_gain, precision: 10, scale: 2

      t.timestamps
    end

    add_index :overheating_codes, :creator_id
    add_index :overheating_codes, :jurisdiction_id
    add_foreign_key :overheating_codes, :users, column: :creator_id
    add_foreign_key :overheating_codes, :jurisdictions, column: :jurisdiction_id
  end

  def down
    drop_table :overheating_codes
  end
end
