RSpec.describe StepCode::BuildingCharacteristics::Line::SpaceHeatingCooling do
  describe "performance type behavior" do
    it "exposes configured fields without requiring a system-type variant" do
      line =
        described_class.new(
          details: "Heat pump",
          performance_type: :hspf,
          performance_value: 9.5
        )

      expect(line.fields).to eq(%i[details performance_type performance_value])
      expect(line.attributes).not_to have_key(:variant)
      expect(line).to be_valid
    end

    it "rejects invalid performance_type values" do
      line =
        described_class.new(details: "Boiler", performance_type: :bad_value)
      expect(line).not_to be_valid
      expect(line.errors.full_messages.join).to include("performance type")
    end

    it "ignores legacy principal/secondary variant keys when loading" do
      line =
        described_class.new(
          details: "Furnace",
          variant: :principal,
          performance_type: :afue,
          performance_value: 90
        )

      expect(line.details).to eq("Furnace")
      expect(line.performance_type).to eq("afue")
      expect(line).to be_valid
    end
  end
end
