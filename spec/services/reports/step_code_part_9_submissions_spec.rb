require "rails_helper"

RSpec.describe Reports::StepCodePart9Submissions do
  let(:range) { Reports::Range.parse("12_months") }
  let(:payload) { described_class.new(range: range).call }

  it "uses a title that says these are attached step codes on submitted permits" do
    expect(described_class.key).to eq("step_code_part_9_submissions")
    expect(described_class.title).to eq(
      "Part 9 step codes on submitted permits"
    )
    expect(described_class.description).to include(
      "attached to a permit application"
    )
    expect(described_class.description).to include("Standalone")
    expect(described_class.description).not_to include("Translation missing")
  end

  it "counts an attached step code once when the permit application is submitted" do
    application =
      create(
        :permit_application,
        :newly_submitted,
        with_fake_plan_document: true
      )
    step_code = create(:part_9_step_code, permit_application: application)
    step_code.find_or_create_checklist_for!(stage: "as_built")

    standalone = create(:part_9_step_code)
    standalone.pre_construction_checklist.update!(
      status: :complete,
      section_completion_status:
        Part9StepCode::Checklist.fully_complete_section_completion_status
    )

    total =
      payload[:headline_figures].find do |figure|
        figure[:key] == "total_submissions"
      end

    expect(total[:value]).to eq(1)
    expect(total[:label]).to eq("Attached Part 9 submissions")
    expect(total[:help_text]).to include("Standalone")
    expect(
      payload[:tables].find { |tbl| tbl[:key] == "by_jurisdiction" }
    ).to be_present
  end

  it "exports the permit application's first submission date" do
    application =
      create(
        :permit_application,
        :newly_submitted,
        with_fake_plan_document: true
      )
    create(:part_9_step_code, permit_application: application)

    csv = described_class.new(range: range).export_csv
    row = CSV.parse(csv, headers: true).first

    expect(row.headers).to include("Submission date")
    expect(row.headers).not_to include("Completed at")
    expect(row.headers).not_to include("Stage")
    expect(row["Submission date"]).to be_present
    expect(row["Application number"]).to eq(application.number)
  end
end
