RSpec.describe StepCode::Part3::V0::Requirements::WholeBuilding do
  describe "#call" do
    let(:checklist) do
      instance_double(
        Part3StepCode::Checklist,
        compliance_metrics: %i[teui tedi ghgi]
      )
    end
    let(:baseline_requirement) do
      {
        teui: 80.0,
        tedi: 50.0,
        ghgi: 4.26,
        total_energy: 80_000,
        modelled_floor_area: 1000.0
      }
    end
    let(:step_code_requirement) do
      { teui: 120.0, tedi: 35.0, ghgi: 1.8, modelled_floor_area: 1000.0 }
    end

    it "returns weighted whole-building requirements" do
      result =
        described_class.new(
          checklist: checklist,
          baseline_requirement: baseline_requirement,
          step_code_requirement: step_code_requirement
        ).call

      expect(result).to eq(
        total_energy: nil,
        teui: 100.0,
        tedi: 42.5,
        ghgi: 3.03
      )
    end

    context "when total floor area is zero" do
      let(:baseline_requirement) do
        {
          teui: 80.0,
          tedi: 50.0,
          ghgi: 4.26,
          total_energy: 80_000,
          modelled_floor_area: 0.0
        }
      end
      let(:step_code_requirement) do
        { teui: 120.0, tedi: 35.0, ghgi: 1.8, modelled_floor_area: 0.0 }
      end

      it "returns nil for all metrics" do
        result =
          described_class.new(
            checklist: checklist,
            baseline_requirement: baseline_requirement,
            step_code_requirement: step_code_requirement
          ).call

        expect(result).to eq(total_energy: nil, teui: nil, tedi: nil, ghgi: nil)
      end
    end
  end
end
