# frozen_string_literal: true

class UpdateMEUITargets < ActiveRecord::Migration[7.2]
  # Representative points inside each seeded range (same ranges as
  # StepCode::Part9::MEUIReferencesSeeder::MAPPINGS).
  HDD_POINT = {
    "Less than 3000" => 0,
    "3000 to 3999" => 3500,
    "4000 to 4999" => 4500,
    "5000 to 5999" => 5500,
    "6000 to 6999" => 6500,
    "More than 6999" => 8000
  }.freeze

  COOLING_POINT = {
    "Not More than 50%" => 0.25,
    "More than 50%" => 0.75
  }.freeze

  AREA_POINT = {
    "<= 50" => 25,
    "51 to 75" => 60,
    "76 to 120" => 100,
    "121 to 165" => 140,
    "166 to 210" => 180,
    "> 210" => 250
  }.freeze

  def up
    records =
      JSON.parse(File.read(Rails.root.join("db/templates/meui_targets.json")))

    MechanicalEnergyUseIntensityReference.transaction do
      records.each do |row|
        ref =
          MechanicalEnergyUseIntensityReference.find_by!(
            "hdd @> (:hdd)::int AND conditioned_space_percent @> (:conditioned_percent)::numeric AND step = (:step)::int AND conditioned_space_area @> (:conditioned_area)::int",
            hdd: HDD_POINT.fetch(row.fetch("hdd")),
            conditioned_percent: COOLING_POINT.fetch(row.fetch("cooling")),
            step: row.fetch("step"),
            conditioned_area: AREA_POINT.fetch(row.fetch("area"))
          )
        # Step 2 is "Reserved" in the updated formulation → null meui.
        ref.update!(meui: row["meui"])
      end
    end
  end

  def down
    raise ActiveRecord::IrreversibleMigration
  end
end
