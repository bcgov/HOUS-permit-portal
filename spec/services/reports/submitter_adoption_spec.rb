require "rails_helper"

RSpec.describe Reports::SubmitterAdoption do
  let(:range) { Reports::Range.parse("12_months") }
  let(:payload) { described_class.new(range: range).call }

  def figure(key)
    payload[:headline_figures].find { |row| row[:key] == key }
  end

  it "splits submitters in range into first-time and returning" do
    first_time = create(:user, :submitter)
    returning = create(:user, :submitter)
    create(:permit_application, submitter: first_time)
    create(:permit_application, submitter: returning)
    create(:permit_application, submitter: returning)

    expect(figure("first_time")[:value]).to eq(1)
    expect(figure("returning")[:value]).to eq(1)
    expect(figure("first_time_share")[:value]).to eq("50.0%")
    expect(figure("mean_applications")[:value]).to eq(1.5)
  end

  it "counts registered submitters who never started an application" do
    create(:user, :submitter)

    expect(figure("never_started")[:value]).to eq(1)
  end

  it "defines live, created, and active" do
    terms = payload[:notes].find { |item| item[:key] == "terms" }

    expect(terms[:text]).to include("not in a sandbox")
    expect(terms[:text]).to include("selected range")
    expect(terms[:text]).to include("since launch")
    expect(figure("mean_applications")[:help_text]).to include(
      "ignores the selected range"
    )
    expect(figure("first_time")[:help_text]).to include("application")
  end

  it "counts projects when the subject is projects" do
    first_time = create(:user, :submitter)
    returning = create(:user, :submitter)
    create(:permit_project, owner: first_time)
    create(:permit_project, owner: returning)
    create(:permit_project, owner: returning)

    project_payload =
      described_class.new(range: range, subject: "projects").call
    value = ->(key) do
      project_payload[:headline_figures].find { |row| row[:key] == key }[:value]
    end

    expect(value.call("first_time")).to eq(1)
    expect(value.call("returning")).to eq(1)
    expect(value.call("mean_applications")).to eq(1.5)
    help =
      project_payload[:headline_figures].find do |row|
        row[:key] == "first_time"
      end[
        :help_text
      ]
    expect(help).to include("project")
    expect(help).not_to include("application")
  end
end
