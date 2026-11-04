require "rails_helper"

RSpec.describe Reports::StepCodePart9 do
  let(:range) { Reports::Range.parse("12_months") }
  let(:payload) { described_class.new(range: range).call }

  def headline(key)
    payload[:headline_figures].find { |figure| figure[:key] == key }
  end

  def mark_complete(checklist, completed_at: Time.current)
    checklist.update!(
      status: :complete,
      section_completion_status:
        checklist.class.fully_complete_section_completion_status,
      stage_completed_at: completed_at
    )
  end

  it "uses the registry key so locale strings resolve" do
    expect(described_class.key).to eq("step_code_part_9")
    expect(described_class.title).to eq("Energy Step Code Part 9")
    expect(described_class.description).not_to include("Translation missing")
  end

  it "counts completed checklists, including standalones and each stage" do
    standalone = create(:part_9_step_code)
    mark_complete(standalone.pre_construction_checklist)
    mark_complete(standalone.find_or_create_checklist_for!(stage: "as_built"))

    create(:part_9_step_code)
    sandboxed = create(:part_9_step_code, sandbox: published_sandbox)
    mark_complete(sandboxed.pre_construction_checklist)

    sections = payload[:headline_figures].map { |figure| figure[:section] }.uniq
    pre_construction = headline("pre_construction_total_completions")
    as_built = headline("as_built_total_completions")

    expect(sections).to eq(%w[Pre-construction Mid-construction As-built])
    expect(pre_construction[:value]).to eq(1)
    expect(as_built[:value]).to eq(1)
    expect(headline("mid_construction_total_completions")[:value]).to eq(0)
    expect(pre_construction[:help_text]).to include("pre-construction")
    expect(pre_construction[:help_text]).not_to include("among")
    expect(payload[:empty]).to eq(false)
  end

  it "counts a completed checklist without data as incomplete, not failed" do
    step_code = create(:part_9_step_code)
    mark_complete(step_code.pre_construction_checklist)

    expect(headline("pre_construction_incomplete_count")[:value]).to eq(1)
    expect(headline("pre_construction_fail_count")[:value]).to eq(0)
    expect(headline("mid_construction_incomplete_count")[:value]).to eq(0)
    expect(headline("as_built_incomplete_count")[:value]).to eq(0)
  end

  it "omits jurisdictions with no completions and links those that have some" do
    with_completions = create(:sub_district)
    quiet = create(:sub_district)
    step_code = create(:part_9_step_code)
    step_code.update!(jurisdiction: with_completions)
    mark_complete(step_code.pre_construction_checklist)
    quiet_step_code = create(:part_9_step_code)
    quiet_step_code.update!(jurisdiction: quiet)

    table = payload[:tables].find { |tbl| tbl[:key] == "by_jurisdiction" }
    names = table[:rows].map { |row| row["jurisdiction"] }
    row =
      table[:rows].find do |entry|
        entry["jurisdiction"] == with_completions.name
      end

    expect(names).not_to include(quiet.name)
    expect(table[:rows]).to all(
      satisfy { |entry| entry["checklists"].to_i.positive? }
    )
    expect(row["checklists"]).to eq(1)
    expect(row["step_codes"]).to eq(1)
    expect(row["enablement"]).to eq("Enabled")
    expect(row["jurisdiction_slug"]).to eq(with_completions.slug)
  end

  it "suppresses charts when volume is below the small-N threshold" do
    step_code = create(:part_9_step_code)
    mark_complete(step_code.pre_construction_checklist)

    expect(payload[:charts].first[:suppressed]).to eq(true)
    expect(payload[:charts].first[:record_count]).to eq(1)
    expect(payload[:tables]).to be_present
  end

  it "exports missing characteristics as empty cells rather than zero" do
    step_code = create(:part_9_step_code)
    step_code.update!(jurisdiction: create(:sub_district))
    mark_complete(step_code.pre_construction_checklist)
    csv = described_class.new(range: range).export_csv
    row = CSV.parse(csv, headers: true).first

    expect(row["Jurisdiction"]).to be_present
    expect(row["Completed at"]).to be_present
    expect(row["Stage"]).to eq("pre_construction")
    expect(row["Air changes per hour"]).to be_blank
    expect(row["Air changes per hour"]).not_to eq("0")
    expect(row["Dwelling units"]).to be_blank
  end
end
