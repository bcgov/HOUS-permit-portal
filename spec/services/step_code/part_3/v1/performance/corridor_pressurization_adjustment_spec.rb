RSpec.describe StepCode::Part3::V1::Performance::CorridorPressurizationAdjustment do
  describe "#call" do
    let(:checklist) do
      create(
        :part_3_checklist,
        occupancy_classifications: occupancies,
        heating_degree_days: heating_degree_days,
        pressurized_doors_count: doors,
        pressurization_airflow_per_door: airflow,
        pressurized_corridors_area: corridor_area,
        make_up_air_fuels: [
          build(
            :make_up_air_fuel,
            fuel_type: build(:fuel_type, :electricity),
            percent_of_load: 1.0
          )
        ]
      )
    end
    let(:occupancies) do
      [
        build(
          :step_code_occupancy,
          :other_residential,
          modelled_floor_area: 1000
        )
      ]
    end
    let(:heating_degree_days) { 4000 }
    let(:doors) { 20 }
    let(:airflow) { 5.0 }
    let(:corridor_area) { 120.0 }

    it "calculates adjustment and clamps to 10.0 kWh/m2/yr cap" do
      result = described_class.new(checklist: checklist).call.results
      expect(result[:teui]).to be_within(0.0001).of(8.096)
      expect(result.dig(:tedi, :whole_building)).to be_within(0.0001).of(8.096)
      expect(result.dig(:tedi, :step_code_portion)).to be_within(0.0001).of(
        8.096
      )
      expect(result[:ghgi]).to be_within(0.0001).of(0.0891)
    end

    context "when raw pressurization result is negative" do
      let(:doors) { 1 }
      let(:airflow) { 0.1 }
      let(:corridor_area) { 1000.0 }

      it "clamps result to zero" do
        result = described_class.new(checklist: checklist).call.results
        expect(result[:teui]).to eq(0)
        expect(result.dig(:tedi, :whole_building)).to eq(0)
      end
    end
  end
end
