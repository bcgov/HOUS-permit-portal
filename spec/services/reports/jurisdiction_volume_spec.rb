require "rails_helper"

RSpec.describe Reports::JurisdictionVolume do
  let(:range) { Reports::Range.parse("12_months") }
  let(:payload) { described_class.new(range: range).call }

  def figure(key)
    payload[:headline_figures].find { |row| row[:key] == key }
  end

  def table_rows
    payload[:tables].find { |tbl| tbl[:key] == "jurisdictions" }[:rows]
  end

  def row_for(jurisdiction)
    table_rows.find { |row| row["jurisdiction"].include?(jurisdiction.name) }
  end

  it "splits drafts, submissions, and revisions per jurisdiction" do
    busy = create(:sub_district)
    quiet = create(:sub_district)
    create(:permit_application, :newly_submitted, jurisdiction: busy)
    create(:permit_application, :resubmitted, jurisdiction: busy)
    create(:permit_application, jurisdiction: busy)
    create(:permit_application, :newly_submitted, jurisdiction: quiet)

    busy_row = row_for(busy)
    expect(busy_row["created"]).to eq(3)
    expect(busy_row["drafts"]).to eq(1)
    expect(busy_row["submitted"]).to eq(2)
    expect(busy_row["revisions"]).to eq(1)
    expect(busy_row["total"]).to eq(4)

    quiet_row = row_for(quiet)
    expect(quiet_row["created"]).to eq(1)
    expect(quiet_row["drafts"]).to be_nil
    expect(quiet_row["submitted"]).to eq(1)
    expect(quiet_row["revisions"]).to be_nil
  end

  it "omits jurisdictions with no activity in range" do
    silent = create(:sub_district)
    create(
      :permit_application,
      :newly_submitted,
      jurisdiction: create(:sub_district)
    )

    expect(row_for(silent)).to be_nil
    expect(table_rows).to all(satisfy { |row| row["total"].to_i.positive? })
  end

  it "reports top-five concentration as a labelled share of submissions" do
    busy = create(:sub_district)
    create(:permit_application, :newly_submitted, jurisdiction: busy)
    create(:permit_application, :newly_submitted, jurisdiction: busy)
    5.times do
      create(
        :permit_application,
        :newly_submitted,
        jurisdiction: create(:sub_district)
      )
    end

    concentration = figure("top_five_concentration")
    expect(concentration[:label]).to match(/concentration/i)
    expect(concentration[:value]).to eq("85.7%")
    expect(concentration[:help_text]).to match(/concentration/i)
    expect(figure("total_submitted")[:value]).to eq(7)
  end

  it "marks the volume table sortable by submitted descending" do
    table = payload[:tables].find { |tbl| tbl[:key] == "jurisdictions" }

    expect(table[:sortable]).to eq(true)
    expect(table[:default_sort]).to eq(key: "submitted", direction: "desc")
    expect(
      table[:columns].find { |column| column[:key] == "created" }[:label]
    ).to eq("Created")
    expect(
      table[:columns].find { |column| column[:key] == "drafts" }[:label]
    ).to eq("Drafts")
  end
end
