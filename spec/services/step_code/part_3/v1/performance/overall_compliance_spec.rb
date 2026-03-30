RSpec.describe StepCode::Part3::V1::Performance::OverallCompliance do
  describe "#call" do
    let(:checklist) do
      create(
        :part_3_checklist,
        occupancy_classifications: [
          build(:step_code_occupancy, :other_residential)
        ]
      )
    end
    let(:requirements) do
      {
        whole_building: {
          teui: 120,
          tedi: 35,
          ghgi: 1.8,
          total_energy: nil
        },
        step_code_portions: {
          area_weighted_totals: {
            tedi: 35
          }
        }
      }
    end
    let(:adjusted_results) do
      {
        teui: 110,
        tedi: {
          whole_building: 30,
          step_code_portion: 30
        },
        ghgi: 1.5,
        total_energy: nil
      }
    end

    it "returns metric compliance and delegated achieved steps" do
      allow(StepCode::Part3::V1::Performance::EnergyStepAchieved).to receive(
        :new
      ).and_return(
        instance_double(
          StepCode::Part3::V1::Performance::EnergyStepAchieved,
          call:
            instance_double(
              StepCode::Part3::V1::Performance::EnergyStepAchieved,
              step: 4
            )
        )
      )
      allow(
        StepCode::Part3::V1::Performance::ZeroCarbonStepAchieved
      ).to receive(:new).and_return(
        instance_double(
          StepCode::Part3::V1::Performance::ZeroCarbonStepAchieved,
          call:
            instance_double(
              StepCode::Part3::V1::Performance::ZeroCarbonStepAchieved,
              step: 4
            )
        )
      )

      result =
        described_class
          .new(
            checklist: checklist,
            requirements: requirements,
            adjusted_results: adjusted_results
          )
          .call
          .results

      expect(result).to include(
        teui: true,
        ghgi: true,
        tedi: {
          whole_building: true,
          step_code_portion: true
        },
        energy_step_achieved: 4,
        zero_carbon_step_achieved: 4
      )
    end
  end
end
