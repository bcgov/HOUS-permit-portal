require "rails_helper"

RSpec.describe Reports::StepCodePart9 do
  let(:range) { Reports::Range.parse("12_months") }
  let(:payload) { described_class.new(range: range).call }

  def create_submitted_part_9
    application =
      create(
        :permit_application,
        :newly_submitted,
        with_fake_plan_document: true
      )
    create(:part_9_step_code, permit_application: application)
  end

  it "counts total submissions as a headline figure" do
    create_submitted_part_9

    total =
      payload[:headline_figures].find do |figure|
        figure[:key] == "total_submissions"
      end
    expect(total[:value]).to eq(1)
    expect(total[:help_text]).to be_present
  end

  it "counts submissions without checklist data as incomplete, not failed" do
    create_submitted_part_9

    incomplete =
      payload[:headline_figures].find do |figure|
        figure[:key] == "incomplete_count"
      end
    failed =
      payload[:headline_figures].find { |figure| figure[:key] == "fail_count" }

    expect(incomplete[:value]).to eq(1)
    expect(failed[:value]).to eq(0)
  end

  it "distinguishes jurisdictions with no submissions from those not enabled" do
    enabled = create(:sub_district)
    not_enabled = create(:sub_district)
    not_enabled.jurisdiction_step_requirements.delete_all

    table = payload[:tables].find { |tbl| tbl[:key] == "by_jurisdiction" }
    enabled_row =
      table[:rows].find { |row| row["jurisdiction"] == enabled.name }
    not_enabled_row =
      table[:rows].find { |row| row["jurisdiction"] == not_enabled.name }

    expect(enabled_row["enablement"]).to include("no submissions")
    expect(not_enabled_row["enablement"]).to include("Not enabled")
  end

  it "suppresses charts when volume is below the small-N threshold" do
    create_submitted_part_9

    expect(payload[:charts].first[:suppressed]).to eq(true)
    expect(payload[:charts].first[:record_count]).to eq(1)
    expect(payload[:tables]).to be_present
  end

  it "exports missing characteristics as empty cells rather than zero" do
    create_submitted_part_9
    csv = described_class.new(range: range).export_csv
    row = CSV.parse(csv, headers: true).first

    expect(row["Jurisdiction"]).to be_present
    expect(row["Air changes per hour"]).to be_blank
    expect(row["Air changes per hour"]).not_to eq("0")
    expect(row["Dwelling units"]).to be_blank
  end
end
