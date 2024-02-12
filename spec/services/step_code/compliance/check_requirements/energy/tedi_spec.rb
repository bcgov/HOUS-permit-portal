RSpec.describe StepCode::Compliance::CheckRequirements::Energy::TEDI do
  let(:step) { 3 }
  let!(:step_code) { create(:step_code, data_entries_attributes:) }
  subject(:compliance_checker) do
    StepCode::Compliance::CheckRequirements::Energy::TEDI.new(
      checklist: step_code.pre_construction_checklist,
      step: step,
    )
  end

  before :each do
    StepCode::TEDIReferencesSeeder.seed!
  end

  context "when tedi is present and does not exceed the energy step requirement" do
    let(:data_entries_attributes) do
      [
        {
          stage: :proposed,
          aux_energy_required: 15065.98,
          above_grade_heated_floor_area: 117.9,
          below_grade_heated_floor_area: 109.9,
          building_volume: 624.9,
          proposed_gshl: 44.11,
          ref_gshl: 62.35,
          hdd: 2851,
        },
      ]
    end

    it_behaves_like PASSING_STEP_CODE
  end

  context "when tedi does not meet energy step requirement but percent improvement does" do
    let(:data_entries_attributes) do
      [
        {
          stage: :proposed,
          aux_energy_required: 35065.98,
          above_grade_heated_floor_area: 117.9,
          below_grade_heated_floor_area: 59.9,
          building_volume: 624.9,
          proposed_gshl: 44.11,
          ref_gshl: 62.35,
          hdd: 2851,
        },
      ]
    end

    it_behaves_like PASSING_STEP_CODE
  end

  context "when neither tedi nor percent improvement meets energy step requirement" do
    let(:data_entries_attributes) do
      [
        {
          stage: :proposed,
          aux_energy_required: 35065.98,
          above_grade_heated_floor_area: 117.9,
          below_grade_heated_floor_area: 59.9,
          building_volume: 624.9,
          proposed_gshl: 61.11,
          ref_gshl: 62.35,
          hdd: 2851,
        },
      ]
    end

    it_behaves_like FAILED_STEP_CODE
  end
end
