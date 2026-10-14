require "rails_helper"

RSpec.describe Reports::StepCodePart3 do
  let(:range) { Reports::Range.parse("12_months") }
  let(:payload) { described_class.new(range: range).call }

  it "uses its own registry key and title" do
    expect(described_class.key).to eq("step_code_part_3")
    expect(described_class.title).to eq("Energy Step Code Part 3")
    expect(described_class.description).not_to include("Translation missing")
  end

  it "counts a submitted Part 3 checklist without occupancies as incomplete" do
    application =
      create(
        :permit_application,
        :newly_submitted,
        with_fake_plan_document: true
      )
    create(:part_3_step_code, permit_application: application)

    total =
      payload[:headline_figures].find do |figure|
        figure[:key] == "total_submissions"
      end
    incomplete =
      payload[:headline_figures].find do |figure|
        figure[:key] == "incomplete_count"
      end

    expect(total[:value]).to eq(1)
    expect(incomplete[:value]).to eq(1)
    expect(payload[:tables]).to be_present
  end
end
