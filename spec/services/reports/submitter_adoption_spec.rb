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
end
