RSpec.describe StepCode::Compliance::CheckRequirements::Energy::Airtightness do
  let(:step) { 3 }
  let!(:step_code) do
    create(
      :part_9_step_code,
      pre_construction_checklist_attributes: {
        data_entries_attributes:
      }
    )
  end
  subject(:compliance_checker) do
    StepCode::Compliance::CheckRequirements::Energy::Airtightness.new(
      checklist: step_code.pre_construction_checklist,
      step: step
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

  context "when ACH meets the energy step requirement" do
    let(:data_entries_attributes) { [{ ach: 22 }, { ach: 22 }] }

    it_behaves_like PASSING_STEP_CODE

    it "does not sum ACH across data entries" do
      expect(compliance_checker.ach).to eq(22)
    end
  end

  context "when multiple data entries have different ACH values" do
    # Excel Calculator Proposed total = AVERAGE(ACH), not volume-weighted.
    let(:data_entries_attributes) do
      [{ ach: 10, building_volume: 100 }, { ach: 20, building_volume: 900 }]
    end

    it "averages ACH across suite/model rows" do
      expect(compliance_checker.ach).to eq(15)
    end
  end

  context "when NLA meets the energy step requirement" do
    let(:data_entries_attributes) do
      [{ ach: 32, nla: 18 }, { ach: 32, nla: 18 }]
    end

    it_behaves_like PASSING_STEP_CODE

    it "does not sum NLA across data entries" do
      expect(compliance_checker.nla).to eq(18)
    end
  end

  context "when multiple data entries have different NLA values" do
    let(:data_entries_attributes) do
      [
        { ach: 32, nla: 10, building_envelope_surface_area: 100 },
        { ach: 32, nla: 20, building_envelope_surface_area: 900 }
      ]
    end

    it "averages NLA across suite/model rows" do
      expect(compliance_checker.nla).to eq(15)
    end
  end

  context "when NLR meets the energy step requirement" do
    let(:data_entries_attributes) do
      [
        {
          ach: 52,
          nla: 42,
          above_grade_heated_floor_area: 117.9,
          below_grade_heated_floor_area: 109.9,
          building_volume: 624.9,
          building_envelope_surface_area: 517.40
        }
      ]
    end

    it_behaves_like PASSING_STEP_CODE
  end

  context "when multiple data entries contribute to NLR" do
    let(:data_entries_attributes) do
      [
        { ach: 36, building_volume: 360, building_envelope_surface_area: 100 },
        { ach: 72, building_volume: 360, building_envelope_surface_area: 100 }
      ]
    end

    it "averages per-suite NLR values (Excel Proposed total)" do
      # Each: volume * ach * 1000 / 3600 / surface → 36 and 72
      expect(compliance_checker.nlr).to eq(54)
    end

    it "still sums volume and surface for display totals" do
      expect(compliance_checker.volume).to eq(720)
      expect(compliance_checker.surface_area).to eq(200)
    end
  end

  context "when ACH, NLA, and NLR all do not meet energy step requirement" do
    let(:data_entries_attributes) do
      [
        {
          ach: 72,
          nla: 42,
          above_grade_heated_floor_area: 117.9,
          below_grade_heated_floor_area: 109.9,
          building_volume: 1624.9,
          building_envelope_surface_area: 517.40
        }
      ]
    end

    it_behaves_like FAILED_STEP_CODE
  end
end
