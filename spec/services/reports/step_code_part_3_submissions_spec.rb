require "rails_helper"

RSpec.describe Reports::StepCodePart3Submissions do
  let(:range) { Reports::Range.parse("12_months") }
  let(:payload) { described_class.new(range: range).call }

  it "uses a title that says these are attached step codes on submitted permits" do
    expect(described_class.key).to eq("step_code_part_3_submissions")
    expect(described_class.title).to eq(
      "Part 3 step codes on submitted permits"
    )
    expect(described_class.description).to include(
      "attached to a permit application"
    )
    expect(described_class.description).to include("Standalone")
    expect(described_class.description).not_to include("Translation missing")
  end

  it "counts an attached step code once and ignores a standalone completion" do
    application =
      create(
        :permit_application,
        :newly_submitted,
        with_fake_plan_document: true
      )
    step_code = create(:part_3_step_code, permit_application: application)
    step_code.find_or_create_checklist_for!(stage: "as_built")

    standalone = create(:part_3_step_code)
    standalone.pre_construction_checklist.update!(
      status: :complete,
      section_completion_status:
        Part3StepCode::Checklist.fully_complete_section_completion_status
    )

    total =
      payload[:headline_figures].find do |figure|
        figure[:key] == "total_submissions"
      end
    incomplete =
      payload[:headline_figures].find do |figure|
        figure[:key] == "incomplete_count"
      end

    expect(total[:value]).to eq(1)
    expect(total[:label]).to eq("Attached Part 3 submissions")
    expect(incomplete[:value]).to eq(1)
    expect(payload[:tables]).to be_present
  end
end
