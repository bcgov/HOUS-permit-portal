RSpec.describe StepCode::Part3::V0::Requirements::StepCode do
  describe "#call" do
    let(:checklist) { create(:part_3_checklist, climate_zone: :zone_6) }
    let!(:residential) do
      create(
        :step_code_occupancy,
        :other_residential,
        checklist: checklist,
        modelled_floor_area: 1000
      )
    end
    let!(:hotel) do
      create(
        :step_code_occupancy,
        checklist: checklist,
        key: :hotel_motel,
        energy_step_required: 4,
        zero_carbon_step_required: 4,
        modelled_floor_area: 500
      )
    end

    it "returns occupancies requirements and area-weighted totals" do
      result = described_class.new(checklist: checklist).call

      expect(result[:occupancies_requirements].size).to eq(2)
      expect(result.dig(:area_weighted_totals, :modelled_floor_area)).to eq(
        1500
      )
      expect(result.dig(:area_weighted_totals, :teui)).to be_within(0.001).of(
        123.333
      )
      expect(result.dig(:area_weighted_totals, :tedi)).to be_within(0.001).of(
        29.333
      )
      expect(result.dig(:area_weighted_totals, :ghgi)).to be_within(0.001).of(
        1.866
      )
    end

    context "when one occupancy is measure-only for GHGI" do
      before { hotel.update!(zero_carbon_step_required: 1) }

      it "returns nil GHGI area-weighted total" do
        result = described_class.new(checklist: checklist).call
        expect(result.dig(:area_weighted_totals, :ghgi)).to be_nil
      end
    end
  end
end
