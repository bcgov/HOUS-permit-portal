require "rails_helper"

RSpec.describe Reports::DraftCompletion do
  let(:range) { Reports::Range.parse("12_months") }
  let(:payload) { described_class.new(range: range).call }

  def figure(key)
    payload[:headline_figures].find { |row| row[:key] == key }
  end

  it "computes completion from applications created in the range" do
    create(:permit_application)
    create(:permit_application, :newly_submitted)

    expect(figure("completion_rate")[:value]).to eq("50.0%")
  end

  it "counts drafts created before the range that were submitted inside it" do
    application =
      create(:permit_application, :newly_submitted, created_at: 2.years.ago)
    application.submission_versions.update_all(created_at: 1.day.ago)

    expect(figure("created_before_submitted_in_range")[:value]).to eq(1)
    expect(figure("completion_rate")[:value]).to be_nil
  end

  it "states the abandonment definition and buckets stale drafts" do
    application = create(:permit_application)
    application.update_column(:updated_at, 100.days.ago)

    expect(figure("abandonment_rate")[:value]).to eq("100.0%")
    stale = payload[:tables].find { |tbl| tbl[:key] == "stale_drafts" }[:rows]
    ninety = stale.find { |row| row["bucket"].include?("90") }
    expect(ninety["count"]).to eq(1)
    expect(payload[:notes].map { |note| note[:key] }).to include(
      "abandonment_definition",
      "range_boundary"
    )
  end

  it "describes creation in words" do
    help = figure("median_draft_to_submit_days")[:help_text]

    expect(help).to include("when the application was created")
    expect(help).not_to include("created_at")
  end

  it "counts projects that left draft" do
    submitted = create(:permit_project, created_at: 2.years.ago)
    submitted.update_columns(
      state: PermitProject.states[:queued],
      enqueued_at: 1.day.ago
    )
    project_payload =
      described_class.new(range: range, subject: "projects").call
    value = ->(key) do
      project_payload[:headline_figures].find { |row| row[:key] == key }[:value]
    end

    expect(value.call("created_before_submitted_in_range")).to eq(1)
    expect(value.call("completion_rate")).to be_nil
    help = project_payload[:headline_figures].first[:help_text]
    expect(help).to include("project")
    expect(help).not_to include("application")
  end
end
