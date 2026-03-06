RSpec.describe StepCode::Part3::V1::EvaluatePerformance do
  describe "#call" do
    let(:checklist) { create(:part_3_checklist) }
    let(:requirements) { { whole_building: { teui: 120 } } }
    let(:results_as_modelled) do
      {
        teui: 101,
        tedi: {
          whole_building: 30,
          step_code_portion: 30
        },
        ghgi: 1.1,
        total_energy: nil
      }
    end
    let(:corridor_adjustment) do
      {
        teui: 8,
        tedi: {
          whole_building: 8,
          step_code_portion: 8
        },
        ghgi: 0.1,
        total_energy: nil
      }
    end
    let(:suite_adjustment) do
      { teui: 0, tedi: nil, ghgi: nil, total_energy: nil }
    end
    let(:adjusted_results) do
      {
        teui: 93,
        tedi: {
          whole_building: 22,
          step_code_portion: 22
        },
        ghgi: 1.0,
        total_energy: nil
      }
    end
    let(:compliance_summary) do
      {
        teui: true,
        tedi: {
          whole_building: true,
          step_code_portion: true
        },
        ghgi: true
      }
    end

    it "returns the composed performance pipeline payload" do
      allow(StepCode::Part3::V1::Performance::ResultsAsModelled).to receive(
        :new
      ).and_return(
        instance_double(
          StepCode::Part3::V1::Performance::ResultsAsModelled,
          call:
            instance_double(
              StepCode::Part3::V1::Performance::ResultsAsModelled,
              results: results_as_modelled
            )
        )
      )
      allow(
        StepCode::Part3::V1::Performance::CorridorPressurizationAdjustment
      ).to receive(:new).and_return(
        instance_double(
          StepCode::Part3::V1::Performance::CorridorPressurizationAdjustment,
          call:
            instance_double(
              StepCode::Part3::V1::Performance::CorridorPressurizationAdjustment,
              results: corridor_adjustment
            )
        )
      )
      allow(
        StepCode::Part3::V1::Performance::SuiteSubMeteringAdjustment
      ).to receive(:new).and_return(
        instance_double(
          StepCode::Part3::V1::Performance::SuiteSubMeteringAdjustment,
          call:
            instance_double(
              StepCode::Part3::V1::Performance::SuiteSubMeteringAdjustment,
              results: suite_adjustment
            )
        )
      )
      allow(StepCode::Part3::V1::Performance::AdjustedResults).to receive(
        :new
      ).and_return(
        instance_double(
          StepCode::Part3::V1::Performance::AdjustedResults,
          call:
            instance_double(
              StepCode::Part3::V1::Performance::AdjustedResults,
              results: adjusted_results
            )
        )
      )
      allow(StepCode::Part3::V1::Performance::OverallCompliance).to receive(
        :new
      ).and_return(
        instance_double(
          StepCode::Part3::V1::Performance::OverallCompliance,
          call:
            instance_double(
              StepCode::Part3::V1::Performance::OverallCompliance,
              results: compliance_summary
            )
        )
      )

      result =
        described_class.new(
          checklist: checklist,
          requirements: requirements
        ).call

      expect(result).to eq(
        requirements: requirements,
        results_as_modelled: results_as_modelled,
        corridor_pressurization_adjustment: corridor_adjustment,
        suite_sub_metering_adjustment: suite_adjustment,
        adjusted_results: adjusted_results,
        compliance_summary: compliance_summary
      )
    end
  end
end
