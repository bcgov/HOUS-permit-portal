RSpec.describe StepCode::Part9::References do
  describe "ZERO_CARBON_REFERENCES" do
    it "defines all four levels" do
      expect(described_class::ZERO_CARBON_REFERENCES.keys).to eq([1, 2, 3, 4])
      expect(
        described_class::ZERO_CARBON_REFERENCES.dig(1, :total_carbon)
      ).to be_nil
      expect(
        described_class::ZERO_CARBON_REFERENCES.dig(4, :fuel_type_other)
      ).to eq(:zero_carbon)
    end
  end

  describe "FUEL_TYPE_RATINGS" do
    it "maps supported fuel categories to ratings" do
      expect(described_class::FUEL_TYPE_RATINGS).to eq(
        carbon: 2,
        zero_carbon: 3
      )
    end
  end
end
