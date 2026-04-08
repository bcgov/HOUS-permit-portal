RSpec.describe StepCode::Part3::V0::Requirements::References::ZeroCarbon do
  describe ".value" do
    it "returns measure-only value at level 1" do
      expect(described_class.value(:residential, 1)).to eq(ghgi: "Measure Only")
    end

    it "returns numeric values for levels 2 to 4" do
      expect(described_class.value(:retail, 2)).to eq(ghgi: 6.0)
      expect(described_class.value(:retail, 3)).to eq(ghgi: 3.0)
      expect(described_class.value(:retail, 4)).to eq(ghgi: 2.0)
    end

    it "returns nil for unknown combinations" do
      expect(described_class.value(:office, 9)).to eq(ghgi: nil)
    end
  end
end
