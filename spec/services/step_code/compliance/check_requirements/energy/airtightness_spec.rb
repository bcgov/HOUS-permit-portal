RSpec.describe StepCode::Compliance::CheckRequirements::Energy::Airtightness do
  let(:step) { 3 }
  let!(:step_code) { create(:step_code, data_entries_attributes:) }
  subject(:compliance_checker) do
    StepCode::Compliance::CheckRequirements::Energy::Airtightness.new(
      checklist: step_code.pre_construction_checklist,
      step: step,
    )
  end

  let(:ach_requirement) { 55 }
  let(:nla_requirement) { 40 }
  let(:nlr_requirement) { 35 }

  before :each do
    allow(subject).to receive(:ach_requirement) { ach_requirement }
    allow(subject).to receive(:nla_requirement) { nla_requirement }
    allow(subject).to receive(:nlr_requirement) { nlr_requirement }
  end

  context "when total ACH meets the energy step requirement" do
    let(:data_entries_attributes) { [{ stage: :proposed, ach: 22 }, { stage: :proposed, ach: 22 }] }

    it_behaves_like "a passing step code requirement"
  end

  context "when total NLA meets the energy step requirement" do
    let(:data_entries_attributes) { [{ stage: :proposed, ach: 32, nla: 18 }, { stage: :proposed, ach: 32, nla: 18 }] }

    it_behaves_like "a passing step code requirement"
  end

  context "when NLR meets the energy step requirement" do
    let(:data_entries_attributes) do
      [
        {
          stage: :proposed,
          ach: 52,
          nla: 42,
          above_grade_heated_floor_area: 117.9,
          below_grade_heated_floor_area: 109.9,
          building_volume: 624.9,
          building_envelope_surface_area: 517.40,
        },
      ]
    end

    it_behaves_like "a passing step code requirement"
  end

  context "when ACH, NLA, and NLR all do not meet energy step requirement" do
    let(:data_entries_attributes) do
      [
        {
          stage: :proposed,
          ach: 72,
          nla: 42,
          above_grade_heated_floor_area: 117.9,
          below_grade_heated_floor_area: 109.9,
          building_volume: 1624.9,
          building_envelope_surface_area: 517.40,
        },
      ]
    end

    it_behaves_like "a failed step code requirement"
  end
end
