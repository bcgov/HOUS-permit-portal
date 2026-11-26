# frozen_string_literal: true

class UpdateMEUITargets < ActiveRecord::Migration[7.2]
  # HUB-5472: Apply Rev. 7 MEUI absolute targets from meui_targets.json.
  # Step 2 absolute MEUI is stored as null ("Reserved").
  #
  # Ranges match StepCode::Part9::MEUIReferencesSeeder::MAPPINGS. We seed the
  # xlsx grid first (no-op if already present), then upsert by containment so
  # local DBs that never ran db:seed still migrate cleanly.

  # HUB-5472-follow-up (SME): For HDD "More than 6999", cooling "More than 50%",
  # Step 3, area "121 to 165", is the Rev. 7 Table 9.36.6.3.-H value 175
  # kWh/m²·year? (An earlier paste had 157; 175 matches the surrounding row
  # pattern.)

  HDD_RANGE = {
    "Less than 3000" => ..2999,
    "3000 to 3999" => 3000..3999,
    "4000 to 4999" => 4000..4999,
    "5000 to 5999" => 5000..5999,
    "6000 to 6999" => 6000..6999,
    "More than 6999" => 7000..
  }.freeze

  COOLING_RANGE = {
    "Not More than 50%" => ..0.5,
    "More than 50%" => 0.5...
  }.freeze

  AREA_RANGE = {
    "<= 50" => ..50,
    "51 to 75" => 51..75,
    "76 to 120" => 76..120,
    "121 to 165" => 121..165,
    "166 to 210" => 166..210,
    "> 210" => 210..
  }.freeze

  # Representative points inside each range (for containment lookup of seeded rows).
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
    StepCode::Part9::MEUIReferencesSeeder.seed!

    records =
      JSON.parse(File.read(Rails.root.join("db/templates/meui_targets.json")))

    MechanicalEnergyUseIntensityReference.transaction do
      records.each do |row|
        hdd_label = row.fetch("hdd")
        cooling_label = row.fetch("cooling")
        area_label = row.fetch("area")
        step = row.fetch("step")

        ref =
          MechanicalEnergyUseIntensityReference.find_by(
            "hdd @> (:hdd)::int AND conditioned_space_percent @> (:conditioned_percent)::numeric AND step = (:step)::int AND conditioned_space_area @> (:conditioned_area)::int",
            hdd: HDD_POINT.fetch(hdd_label),
            conditioned_percent: COOLING_POINT.fetch(cooling_label),
            step: step,
            conditioned_area: AREA_POINT.fetch(area_label)
          )

        if ref.nil?
          ref =
            MechanicalEnergyUseIntensityReference.create!(
              hdd: HDD_RANGE.fetch(hdd_label),
              conditioned_space_percent: COOLING_RANGE.fetch(cooling_label),
              step: step,
              conditioned_space_area: AREA_RANGE.fetch(area_label)
            )
        end

        # Step 2 is "Reserved" in the updated formulation → null meui.
        ref.update!(meui: row["meui"])
      end
    end
  end

  def down
    raise ActiveRecord::IrreversibleMigration
  end
end
