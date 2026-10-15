require "rails_helper"

RSpec.describe Reports::SubmitterJourney do
  let(:range) { Reports::Range.parse("12_months") }
  let(:payload) { described_class.new(range: range).call }

  def figure(key)
    payload[:headline_figures].find { |row| row[:key] == key }
  end

  def step_row(key)
    payload[:tables].first[:rows].find { |row| row["step_key"] == key }
  end

  it "whittles projects created in the range and counts each project once" do
    create(:permit_project)
    create(:permit_application)
    create(:permit_application, :newly_submitted)
    issued = create(:permit_application, :newly_submitted)
    issued.update_column(:issued_at, Time.current)

    twice = create(:permit_project)
    create(:permit_application, permit_project: twice, submitter: twice.owner)
    create(
      :permit_application,
      :newly_submitted,
      permit_project: twice,
      submitter: twice.owner
    )

    outside = create(:permit_application, :newly_submitted)
    outside.permit_project.update_column(:created_at, 2.years.ago)

    discarded = create(:permit_application)
    discarded.update_column(:discarded_at, Time.current)

    late = create(:permit_application, :newly_submitted)
    late.submission_versions.update_all(created_at: 2.days.from_now)

    expect(step_row("created")["count"]).to eq(7)
    expect(step_row("started")["count"]).to eq(5)
    expect(step_row("submitted")["count"]).to eq(4)
    expect(step_row("issued")["count"]).to eq(1)
    counts = payload[:tables].first[:rows].map { |row| row["count"] }
    expect(counts).to eq(counts.sort.reverse)

    expect(figure("created")[:value]).to eq(7)
    expect(figure("started_share")[:value]).to eq("71.4%")
    expect(figure("submitted_share")[:value]).to eq("57.1%")
    expect(figure("issued_share")[:value]).to eq("14.3%")
    expect(step_row("issued")["dropped"]).to eq(3)
    expect(step_row("issued")["drop_label"]).to include("not issued")
    expect(step_row("submitted")["drop_label"]).to include("did not submit")
    expect(payload[:charts].first[:type]).to eq("funnel")
    expect(payload[:notes].map { |note| note[:key] }).to include(
      "milestones_after_range",
      "issued_is_not_abandonment"
    )
    expect(figure("issued_share")[:help_text]).not_to include("issued_at")
  end
end
