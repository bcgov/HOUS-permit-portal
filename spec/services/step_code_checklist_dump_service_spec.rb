require "rails_helper"

RSpec.describe StepCodeChecklistDumpService do
  def fill_roof_lines(checklist, lines)
    checklist.building_characteristics_summary.update!(
      roof_ceilings_lines: lines
    )
  end

  def rows_for(range)
    csv = described_class.new(range: Reports::Range.parse(range)).part_9_csv
    CSV.parse(csv, headers: true)
  end

  it "pads repeating line columns to twice the all-time nonempty max" do
    wide = create(:part_9_step_code)
    narrow = create(:part_9_step_code)
    fill_roof_lines(
      wide.pre_construction_checklist,
      [{ details: "attic", rsi: "10.5" }, { details: "vaulted", rsi: "8" }]
    )
    fill_roof_lines(
      narrow.pre_construction_checklist,
      [{ details: "single", rsi: "4" }]
    )

    rows = rows_for("all_time")

    expect(rows.headers).to include(
      "Roof ceiling details 1",
      "Roof ceiling average effective RSI 1",
      "Roof ceiling details 2",
      "Roof ceiling average effective RSI 2",
      "Roof ceiling details 4",
      "Roof ceiling average effective RSI 4"
    )
    expect(rows.headers).not_to include("Roof ceiling details 5")
    expect(rows.headers).to include("Space heating / cooling details 1")
    expect(rows.headers).not_to include("Space heating / cooling details 2")

    wide_row = rows.find { |row| row["Roof ceiling details 2"] == "vaulted" }
    narrow_row = rows.find { |row| row["Roof ceiling details 1"] == "single" }

    expect(wide_row["Roof ceiling average effective RSI 1"]).to eq("10.5")
    expect(narrow_row["Roof ceiling details 2"]).to be_blank
    expect(wide_row["Roof ceiling details 4"]).to be_blank
  end

  it "includes only checklists created in the selected range, with all-time column widths" do
    in_range = create(:part_9_step_code)
    fill_roof_lines(
      in_range.pre_construction_checklist,
      [{ details: "recent", rsi: "1" }]
    )
    old = create(:part_9_step_code)
    fill_roof_lines(
      old.pre_construction_checklist,
      [
        { details: "old", rsi: "2" },
        { details: "older", rsi: "3" },
        { details: "oldest", rsi: "4" }
      ]
    )
    old.pre_construction_checklist.update_column(:created_at, 2.years.ago)

    rows = rows_for("12_months")

    expect(rows.map { |row| row["Roof ceiling details 1"] }).to eq(["recent"])
    expect(rows.headers).to include("Roof ceiling details 6")
    expect(rows.headers).not_to include("Roof ceiling details 7")
  end
end
