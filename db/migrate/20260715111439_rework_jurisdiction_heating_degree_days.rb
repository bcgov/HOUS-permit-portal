class ReworkJurisdictionHeatingDegreeDays < ActiveRecord::Migration[7.1]
  def up
    rename_table :jurisdiction_climate_zones, :jurisdiction_heating_degree_days

    add_column :jurisdiction_heating_degree_days, :location_name, :string

    # Drop rows without HDD — invalid under the new required-HDD rule
    execute <<~SQL.squish
      DELETE FROM jurisdiction_heating_degree_days
      WHERE heating_degree_days IS NULL
    SQL

    # Backfill location names: first row per jurisdiction => "General", then "Location 2", ...
    execute <<~SQL.squish
      WITH ranked AS (
        SELECT
          id,
          ROW_NUMBER() OVER (
            PARTITION BY jurisdiction_id
            ORDER BY created_at ASC, id ASC
          ) AS rn
        FROM jurisdiction_heating_degree_days
      )
      UPDATE jurisdiction_heating_degree_days AS jhdd
      SET location_name = CASE
        WHEN ranked.rn = 1 THEN 'General'
        ELSE 'Location ' || ranked.rn::text
      END
      FROM ranked
      WHERE jhdd.id = ranked.id
    SQL

    change_column_null :jurisdiction_heating_degree_days, :location_name, false
    change_column_null :jurisdiction_heating_degree_days,
                       :heating_degree_days,
                       false

    remove_index :jurisdiction_heating_degree_days,
                 name: "idx_jurisdiction_climate_zones_unique"
    remove_column :jurisdiction_heating_degree_days, :climate_zone, :string

    add_index :jurisdiction_heating_degree_days,
              %i[jurisdiction_id location_name],
              unique: true,
              name: "idx_jurisdiction_heating_degree_days_unique"
    # jurisdiction_id index is auto-renamed with the table by Postgres
  end

  def down
    remove_index :jurisdiction_heating_degree_days,
                 name: "idx_jurisdiction_heating_degree_days_unique"

    add_column :jurisdiction_heating_degree_days, :climate_zone, :string

    # Best-effort reverse: derive climate_zone from HDD via the same thresholds
    execute <<~SQL.squish
      UPDATE jurisdiction_heating_degree_days
      SET climate_zone = CASE
        WHEN heating_degree_days <= 2999 THEN 'zone_4'
        WHEN heating_degree_days <= 3999 THEN 'zone_5'
        WHEN heating_degree_days <= 4999 THEN 'zone_6'
        WHEN heating_degree_days <= 5999 THEN 'zone_7a'
        WHEN heating_degree_days <= 6999 THEN 'zone_7b'
        ELSE 'zone_8'
      END
    SQL

    change_column_null :jurisdiction_heating_degree_days, :climate_zone, false
    change_column_null :jurisdiction_heating_degree_days,
                       :heating_degree_days,
                       true

    remove_column :jurisdiction_heating_degree_days, :location_name, :string

    add_index :jurisdiction_heating_degree_days,
              %i[jurisdiction_id climate_zone],
              unique: true,
              name: "idx_jurisdiction_climate_zones_unique"

    rename_table :jurisdiction_heating_degree_days, :jurisdiction_climate_zones
  end
end
