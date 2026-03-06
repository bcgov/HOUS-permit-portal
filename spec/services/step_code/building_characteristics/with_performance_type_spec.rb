RSpec.describe StepCode::BuildingCharacteristics::WindowsGlazedDoors do
  describe "performance_type validation" do
    it "is valid for accepted performance types" do
      model = described_class.new(performance_type: :usi, lines: [])
      expect(model).to be_valid
      expect(model.performance_type).to eq("usi")
    end

    it "is invalid for unsupported performance types" do
      model = described_class.new(performance_type: :invalid_type, lines: [])
      expect(model).not_to be_valid
      expect(model.errors.full_messages.join).to include("performance type")
    end
  end
end
