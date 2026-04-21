RSpec.describe StepCode::Part3::V0::Requirements::References::ClimateZone do
  describe ".value" do
    it "returns nil for nil input" do
      expect(described_class.value(nil)).to be_nil
    end

    it "maps boundary values to the expected zone" do
      expect(described_class.value(2999)).to eq("zone_4")
      expect(described_class.value(3000)).to eq("zone_5")
      expect(described_class.value(3999)).to eq("zone_5")
      expect(described_class.value(4000)).to eq("zone_6")
      expect(described_class.value(4999)).to eq("zone_6")
      expect(described_class.value(5000)).to eq("zone_7A")
      expect(described_class.value(5999)).to eq("zone_7A")
      expect(described_class.value(6000)).to eq("zone_7B")
      expect(described_class.value(6999)).to eq("zone_7B")
      expect(described_class.value(7000)).to eq("zone_8")
    end

    it "returns zone_8 at and above 8000 HDD" do
      expect(described_class.value(8000)).to eq("zone_8")
    end
  end
end
