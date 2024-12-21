RSpec.describe StepCode::Part3::V1::Performance::ResultsAsModelled do
  let(:checklist) do
    create(
      :part_3_checklist,
      occupancy_classifications: occupancies,
      modelled_energy_outputs: build_list(:energy_output, 3, :modelled),
      generated_electricity: 0,
      total_annual_thermal_energy_demand: 30_000
    )
  end

  subject(:compliance_checker) do
    StepCode::Part3::V1::Performance::ResultsAsModelled.new(
      checklist: checklist
    )
  end

  before :each do
    subject.call
  end

  context "when the building has step code occupancies" do
    let(:occupancies) do
      build_list(:step_code_occupancy, 1, :other_residential)
    end

    it_behaves_like PART_3_COMPLIANCE_RESULTS
  end

  context "when the building does not have step code occupancies" do
    let(:occupancies) { build_list(:step_code_occupancy, 1, :low_industrial) }

    it_behaves_like PART_3_COMPLIANCE_RESULTS
  end
end
