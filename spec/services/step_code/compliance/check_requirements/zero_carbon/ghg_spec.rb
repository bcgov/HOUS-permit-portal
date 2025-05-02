RSpec.describe StepCode::Compliance::CheckRequirements::ZeroCarbon::GHG do
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
    StepCode::Compliance::CheckRequirements::ZeroCarbon::GHG.new(
      checklist: step_code.pre_construction_checklist,
      step: step
    )
  end

  let(:total_ghg_requirement) { 440 }

  before :each do
    allow(subject).to receive(:total_ghg_requirement) { total_ghg_requirement }
  end

  context "when total GHG requirement is zero" do
    let(:data_entries_attributes) do
      [
        {
          electrical_consumption: 0,
          natural_gas_consumption: 0,
          propane_consumption: 0
        },
        {
          electrical_consumption: 0,
          natural_gas_consumption: 0,
          propane_consumption: 0
        }
      ]
    end

    it_behaves_like FAILED_STEP_CODE
  end

  context "when total GHG meets the requirement" do
    let(:data_entries_attributes) do
      [
        {
          electrical_consumption: 45.53,
          natural_gas_consumption: 0.02,
          propane_consumption: 0
        },
        {
          electrical_consumption: 45.93,
          natural_gas_consumption: 0.02,
          propane_consumption: 0
        }
      ]
    end

    it_behaves_like PASSING_STEP_CODE
  end

  context "when total GHG does not meet requirement" do
    let(:data_entries_attributes) do
      [
        {
          electrical_consumption: 145.53,
          natural_gas_consumption: 32.02,
          propane_consumption: 99.38,
          district_energy_consumption: 223.23,
          district_energy_ef: 32.3
        },
        {
          electrical_consumption: 425.93,
          natural_gas_consumption: 33.02,
          propane_consumption: 98.32,
          district_energy_consumption: 223.23,
          district_energy_ef: 32.3
        }
      ]
    end

    it_behaves_like FAILED_STEP_CODE
  end
end
