RSpec.describe StepCode::Part3::V0::Requirements::References::Energy do
  describe ".value" do
    it "returns table values for known combinations" do
      described_class::LOOKUP.each do |item|
        expect(
          described_class.value(item[:type], item[:zone], item[:step])
        ).to eq(teui: item[:teui], tedi: item[:tedi])
      end
    end

    it "returns nil metrics for unknown combinations" do
      expect(described_class.value(:office, :zone_4, 4)).to eq(
        teui: nil,
        tedi: nil
      )
    end
  end
end
