RSpec.describe StepCode::BuildingCharacteristics::FossilFuels do
  describe "presence mapping and fields" do
    it "maps presence values and returns normalized keys" do
      model = described_class.new(presence: :yes, details: "gas boiler")
      expect(model.presence).to eq("yes")

      model.presence = :no
      expect(model.presence).to eq("no")

      model.presence = :unknown
      expect(model.presence).to eq("unknown")
    end

    it "defines expected fields" do
      expect(described_class.new({}).fields).to eq(%i[presence details])
    end
  end
end
