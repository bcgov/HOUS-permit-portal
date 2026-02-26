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

      # Cooling Zone Compliance
      t.string :designated_rooms
      # [OVERHEATING TODO] Units field purpose unclear — btuh is already labeled on the capacity input
      t.integer :cooling_zone_units
      t.decimal :minimum_cooling_capacity, precision: 10, scale: 2

      # Design Conditions
      t.decimal :design_outdoor_temp, precision: 5, scale: 1
      t.decimal :design_indoor_temp, precision: 5, scale: 1
      t.decimal :design_adjacent_temp, precision: 5, scale: 1
      t.decimal :cooling_zone_area, precision: 10, scale: 2
      t.string :weather_location
      t.decimal :ventilation_rate, precision: 10, scale: 2
      t.boolean :hrv_erv, default: false
      t.decimal :atre_percentage, precision: 5, scale: 2

      # Building Components & Assemblies
      t.jsonb :components_facing_outside, default: []
      t.jsonb :components_facing_adjacent, default: []

      # Attached Documents & Notes
      t.jsonb :document_notes, default: []

      # Calculations Performed By
      t.string :performer_name
      t.string :performer_company
      t.string :performer_address
      t.string :performer_city_province
      t.string :performer_postal_code
      t.string :performer_phone
      t.string :performer_fax
      t.string :performer_email
      # Attestation
      t.string :accreditation_ref1
      t.string :accreditation_ref2
      t.string :issued_for1
      t.string :issued_for2

      t.datetime :discarded_at

      t.timestamps
    end

    add_index :overheating_codes, :creator_id
    add_index :overheating_codes, :jurisdiction_id
    add_index :overheating_codes, :discarded_at
    add_foreign_key :overheating_codes, :users, column: :creator_id
    add_foreign_key :overheating_codes, :jurisdictions, column: :jurisdiction_id
  end

  def down
    drop_table :overheating_codes
  end
end
