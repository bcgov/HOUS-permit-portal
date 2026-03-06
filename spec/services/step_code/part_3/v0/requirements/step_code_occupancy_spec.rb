RSpec.describe StepCode::Part3::V0::Requirements::StepCodeOccupancy do
  describe "#call" do
    let(:occupancy) do
      build(:step_code_occupancy, :other_residential, modelled_floor_area: 1000)
    end

    it "returns requirements for an individual occupancy" do
      result =
        described_class.new(occupancy: occupancy, climate_zone: :zone_6).call

      expect(result).to eq(
        occupancy: "residential",
        modelled_floor_area: 1000,
        teui: 120,
        tedi: 35,
        ghgi: 1.8
      )
    end
  end
end
