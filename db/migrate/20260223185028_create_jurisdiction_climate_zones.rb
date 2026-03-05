class CreateJurisdictionClimateZones < ActiveRecord::Migration[7.1]
  def change
    create_table :jurisdiction_climate_zones, id: :uuid do |t|
      t.references :jurisdiction,
                   null: false,
                   foreign_key: {
                     on_delete: :cascade
                   },
                   type: :uuid
      t.string :climate_zone, null: false
      t.integer :heating_degree_days

      t.timestamps
    end

    add_index :jurisdiction_climate_zones,
              %i[jurisdiction_id climate_zone],
              unique: true,
              name: "idx_jurisdiction_climate_zones_unique"
  end
end
