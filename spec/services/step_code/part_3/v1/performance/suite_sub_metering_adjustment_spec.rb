RSpec.describe StepCode::Part3::V1::Performance::SuiteSubMeteringAdjustment do
  describe "#call" do
    let(:checklist) do
      create(
        :part_3_checklist,
        occupancy_classifications: [
          build(
            :step_code_occupancy,
            :other_residential,
            modelled_floor_area: 1000
          )
        ],
        suite_heating_energy: suite_heating_energy
      )
    end
    let(:suite_heating_energy) { 10_000 }

    it "calculates suite sub-metering TEUI adjustment" do
      result = described_class.new(checklist: checklist).call.results
      expect(result).to eq(teui: 1.5, tedi: nil, ghgi: nil, total_energy: nil)
    end

    context "when suite heating energy is blank" do
      let(:suite_heating_energy) { nil }

      it "returns zero TEUI adjustment" do
        result = described_class.new(checklist: checklist).call.results
        expect(result[:teui]).to eq(0)
      end
    end
  end
end
