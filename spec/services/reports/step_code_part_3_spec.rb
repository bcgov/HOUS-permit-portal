require "rails_helper"

RSpec.describe Reports::StepCodePart3 do
  let(:range) { Reports::Range.parse("12_months") }
  let(:payload) { described_class.new(range: range).call }

  def mark_complete(checklist, completed_at: Time.current)
    checklist.update!(
      status: :complete,
      section_completion_status:
        checklist.class.fully_complete_section_completion_status,
      stage_completed_at: completed_at
    )
  end

  it "uses its own registry key and title" do
    expect(described_class.key).to eq("step_code_part_3")
    expect(described_class.title).to eq("Energy Step Code Part 3")
    expect(described_class.description).not_to include("Translation missing")
  end

  it "counts completed checklists, including standalones and each stage" do
    standalone = create(:part_3_step_code)
    mark_complete(standalone.pre_construction_checklist)
    mark_complete(standalone.find_or_create_checklist_for!(stage: "as_built"))

    create(:part_3_step_code)
    sandboxed = create(:part_3_step_code, sandbox: published_sandbox)
    mark_complete(sandboxed.pre_construction_checklist)

    total =
      payload[:headline_figures].find do |figure|
        figure[:key] == "total_completions"
      end
    incomplete =
      payload[:headline_figures].find do |figure|
        figure[:key] == "incomplete_count"
      end

    expect(total[:value]).to eq("2 checklists among 1 step code")
    expect(incomplete[:value]).to eq("2 checklists among 1 step code")
    expect(payload[:tables]).to be_present
  end
end
