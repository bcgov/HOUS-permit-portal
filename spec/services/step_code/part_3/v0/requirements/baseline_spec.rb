RSpec.describe StepCode::Part3::V0::Requirements::Baseline do
  describe "#call" do
    let(:checklist) do
      create(:part_3_checklist, ref_annual_thermal_energy_demand: 50_000)
    end
    let!(:baseline_occupancy) do
      create(
        :step_code_occupancy,
        :low_industrial,
        checklist: checklist,
        modelled_floor_area: 1000
      )
    end

    let!(:electricity) do
      create(:fuel_type, :electricity, checklist: checklist)
    end
    let!(:natural_gas) do
      create(:fuel_type, :natural_gas, checklist: checklist)
    end

    let!(:reference_electricity) do
      create(
        :energy_output,
        :reference,
        checklist: checklist,
        fuel_type: electricity,
        annual_energy: 60_000
      )
    end
    let!(:reference_gas) do
      create(
        :energy_output,
        :reference,
        checklist: checklist,
        fuel_type: natural_gas,
        annual_energy: 20_000
      )
    end

    it "calculates baseline TEUI, TEDI, GHGI, and total energy" do
      result = described_class.new(checklist: checklist).call

      expect(result[:teui]).to eq(80.0)
      expect(result[:tedi]).to eq(50.0)
      expect(result[:ghgi]).to be_within(0.0001).of(4.26)
      expect(result[:total_energy]).to eq(80_000)
      expect(result[:modelled_floor_area]).to eq(1000)
    end

    context "when total MFA is zero" do
      before { baseline_occupancy.update!(modelled_floor_area: 0) }

      it "returns nil metrics that depend on division by MFA" do
        result = described_class.new(checklist: checklist).call
        expect(result[:teui]).to be_nil
        expect(result[:tedi]).to be_nil
        expect(result[:ghgi]).to be_nil
        expect(result[:modelled_floor_area]).to eq(0)
      end
    end

    context "when there are no reference outputs" do
      before { checklist.reference_energy_outputs.delete_all }

      it "returns nil for GHGI and TEUI and zero total energy" do
        result = described_class.new(checklist: checklist).call

        expect(result[:ghgi]).to be_nil
        expect(result[:teui]).to be_nil
        expect(result[:total_energy]).to eq(0)
      end
    end
  end
end
