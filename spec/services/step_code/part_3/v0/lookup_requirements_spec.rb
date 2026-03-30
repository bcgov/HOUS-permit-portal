RSpec.describe StepCode::Part3::V0::LookupRequirements do
  describe "#call" do
    let(:checklist) { create(:part_3_checklist) }
    let(:baseline_result) do
      {
        teui: 80,
        tedi: 50,
        ghgi: 4.26,
        total_energy: 80_000,
        modelled_floor_area: 1000
      }
    end
    let(:step_code_result) do
      {
        occupancies_requirements: [],
        area_weighted_totals: {
          teui: 120,
          tedi: 35,
          ghgi: 1.8,
          modelled_floor_area: 1000
        }
      }
    end
    let(:whole_building_result) do
      { teui: 100, tedi: 42.5, ghgi: 3.03, total_energy: nil }
    end

    it "returns baseline, step code, and whole building requirements" do
      allow(StepCode::Part3::V0::Requirements::Baseline).to receive(:new).with(
        checklist: checklist
      ).and_return(
        instance_double(
          StepCode::Part3::V0::Requirements::Baseline,
          call: baseline_result
        )
      )

      allow(StepCode::Part3::V0::Requirements::StepCode).to receive(:new).with(
        checklist: checklist
      ).and_return(
        instance_double(
          StepCode::Part3::V0::Requirements::StepCode,
          call: step_code_result
        )
      )

      allow(StepCode::Part3::V0::Requirements::WholeBuilding).to receive(
        :new
      ).with(
        checklist: checklist,
        baseline_requirement: baseline_result,
        step_code_requirement: step_code_result[:area_weighted_totals]
      ).and_return(
        instance_double(
          StepCode::Part3::V0::Requirements::WholeBuilding,
          call: whole_building_result
        )
      )

      result = described_class.new(checklist: checklist).call

      expect(result).to eq(
        baseline_portions: baseline_result,
        step_code_portions: step_code_result,
        whole_building: whole_building_result
      )
    end
  end
end
