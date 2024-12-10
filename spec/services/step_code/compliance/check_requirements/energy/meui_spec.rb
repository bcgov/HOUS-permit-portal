RSpec.describe StepCode::Compliance::CheckRequirements::Energy::MEUI do
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
    StepCode::Compliance::CheckRequirements::Energy::MEUI.new(
      checklist: step_code.pre_construction_checklist,
      step: step
    )
  end

  before :each do
    StepCode::Part9::MEUIReferencesSeeder.seed!
    StepCode::Part9::TEDIReferencesSeeder.seed!
  end

  context "when meui is present and does not exceed the energy step requirement" do
    let(:data_entries_attributes) do
      [
        {
          aec: 45.56,
          baseloads: 25.62,
          above_grade_heated_floor_area: 117.9,
          below_grade_heated_floor_area: 109.9,
          hdd: 2851,
          design_cooling_load: 2189.98,
          air_heat_pump_cooling_capacity: 9
        }
      ]
    end

    it_behaves_like PASSING_STEP_CODE
  end

  context "when meui does not meet energy step requirement but percent improvement does" do
    let(:data_entries_attributes) do
      [
        {
          aec: 45.56,
          baseloads: 25.62,
          above_grade_heated_floor_area: 7.9,
          below_grade_heated_floor_area: 9.9,
          hdd: 2851,
          design_cooling_load: 2189.98,
          air_heat_pump_cooling_capacity: 9,
          building_volume: 624.9,
          ref_aec: 72.92
        }
      ]
    end

    it_behaves_like PASSING_STEP_CODE
  end

  context "when neither meui nor percent improvement meets energy step requirement" do
    let(:data_entries_attributes) do
      [
        {
          aec: 65.56,
          baseloads: 25.62,
          above_grade_heated_floor_area: 7.9,
          below_grade_heated_floor_area: 9.9,
          hdd: 2851,
          design_cooling_load: 2189.98,
          air_heat_pump_cooling_capacity: 9,
          building_volume: 624.9,
          ref_aec: 72.92
        }
      ]
    end

    it_behaves_like FAILED_STEP_CODE
  end
end
