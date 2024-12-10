RSpec.describe StepCode::Compliance::CheckRequirements::ZeroCarbon::CO2 do
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
    StepCode::Compliance::CheckRequirements::ZeroCarbon::CO2.new(
      checklist: step_code.pre_construction_checklist,
      step: step
    )
  end

  let(:co2_requirement) { 2.5 }
  let(:co2_max_requirement) { 800 }

  before :each do
    allow(subject).to receive(:co2_requirement) { co2_requirement }
    allow(subject).to receive(:co2_max_requirement) { co2_max_requirement }
  end

  context "when total GHG is zero" do
    let(:data_entries_attributes) do
      [
        {
          electrical_consumption: 0,
          natural_gas_consumption: 0,
          propane_consumption: 0
        }
      ]
    end
    it_behaves_like FAILED_STEP_CODE
  end

  context "when CO2 and GHG both meet requirement" do
    let(:data_entries_attributes) do
      [
        {
          electrical_consumption: 45.53,
          natural_gas_consumption: 0.02,
          propane_consumption: 0,
          above_grade_heated_floor_area: 117.9,
          below_grade_heated_floor_area: 109.90
        },
        {
          electrical_consumption: 45.93,
          natural_gas_consumption: 0.02,
          propane_consumption: 0,
          above_grade_heated_floor_area: 117.9,
          below_grade_heated_floor_area: 109.90
        }
      ]
    end

    it_behaves_like PASSING_STEP_CODE
  end

  context "when CO2 does not meet requirement" do
    let(:data_entries_attributes) do
      [
        {
          electrical_consumption: 185.53,
          natural_gas_consumption: 20.02,
          propane_consumption: 23.02,
          above_grade_heated_floor_area: 2.9,
          below_grade_heated_floor_area: 1.8
        },
        {
          electrical_consumption: 185.93,
          natural_gas_consumption: 20.02,
          propane_consumption: 23.02,
          above_grade_heated_floor_area: 1.2,
          below_grade_heated_floor_area: 1.4
        }
      ]
    end

    it_behaves_like FAILED_STEP_CODE
  end

  context "when CO2 passes but total GHG does not meet requirement" do
    let(:data_entries_attributes) do
      [
        {
          electrical_consumption: 945.53,
          natural_gas_consumption: 32.02,
          propane_consumption: 49.38,
          district_energy_consumption: 223.23,
          district_energy_ef: 32.3,
          above_grade_heated_floor_area: 911.2,
          below_grade_heated_floor_area: 2221.4
        },
        {
          electrical_consumption: 1225.93,
          natural_gas_consumption: 33.02,
          propane_consumption: 48.32,
          district_energy_consumption: 223.23,
          district_energy_ef: 32.3,
          above_grade_heated_floor_area: 911.2,
          below_grade_heated_floor_area: 2221.4
        }
      ]
    end

    it_behaves_like FAILED_STEP_CODE
  end

  context "when neither CO2 nor total GHG meets energy step requirement" do
    let(:data_entries_attributes) do
      [
        {
          electrical_consumption: 145.53,
          natural_gas_consumption: 32.02,
          propane_consumption: 99.38,
          district_energy_consumption: 23.23,
          district_energy_ef: 32.3,
          above_grade_heated_floor_area: 111.2,
          below_grade_heated_floor_area: 21.4
        },
        {
          electrical_consumption: 425.93,
          natural_gas_consumption: 33.02,
          propane_consumption: 98.32,
          district_energy_consumption: 23.23,
          district_energy_ef: 32.3,
          above_grade_heated_floor_area: 111.2,
          below_grade_heated_floor_area: 21.4
        }
      ]
    end

    it_behaves_like FAILED_STEP_CODE
  end
end
