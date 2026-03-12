RSpec.describe StepCode::Part3::V1::Performance::AdjustedResults do
  describe "#call" do
    let(:checklist) do
      instance_double(
        Part3StepCode::Checklist,
        compliance_metrics: %i[teui tedi ghgi]
      )
    end

    it "subtracts corridor and adds suite sub-metering adjustments" do
      results =
        described_class
          .new(
            checklist: checklist,
            results_as_modelled: {
              teui: 100.0,
              tedi: {
                whole_building: 30.0,
                step_code_portion: 20.0
              },
              ghgi: 2.0,
              total_energy: nil
            },
            corridor_pressurization_adjustment: {
              teui: 5.0,
              tedi: {
                whole_building: 5.0,
                step_code_portion: 4.0
              },
              ghgi: 0.4,
              total_energy: nil
            },
            suite_sub_metering_adjustment: {
              teui: 2.0,
              tedi: nil,
              ghgi: nil,
              total_energy: nil
            }
          )
          .call
          .results

      expect(results).to eq(
        teui: 97.0,
        tedi: {
          whole_building: 25.0,
          step_code_portion: 16.0
        },
        ghgi: 1.6,
        total_energy: nil
      )
    end

    it "returns nil when modelled values are zero" do
      results =
        described_class
          .new(
            checklist: checklist,
            results_as_modelled: {
              teui: 0,
              tedi: {
                whole_building: 0,
                step_code_portion: 0
              },
              ghgi: 0,
              total_energy: 0
            },
            corridor_pressurization_adjustment: {
              teui: 1,
              tedi: {
                whole_building: 1,
                step_code_portion: 1
              },
              ghgi: 1,
              total_energy: 1
            },
            suite_sub_metering_adjustment: {
              teui: 0,
              tedi: nil,
              ghgi: nil,
              total_energy: nil
            }
          )
          .call
          .results

      expect(results).to eq(
        teui: nil,
        tedi: {
          whole_building: nil,
          step_code_portion: nil
        },
        ghgi: nil,
        total_energy: nil
      )
    end
  end
end
