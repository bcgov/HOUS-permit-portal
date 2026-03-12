RSpec.describe StepCode::BuildingCharacteristics::Line::SpaceHeatingCooling do
  describe "variant and performance type behavior" do
    it "maps variants and exposes configured fields" do
      line =
        described_class.new(
          details: "Heat pump",
          variant: :principal,
          performance_type: :hspf,
          performance_value: 9.5
        )

      expect(line.variant).to eq("principal")
      expect(line.fields).to eq(
        %i[details variant performance_type performance_value]
      )
      expect(line).to be_valid
    end

    it "rejects invalid performance_type values" do
      line =
        described_class.new(
          details: "Boiler",
          variant: :secondary,
          performance_type: :bad_value
        )
      expect(line).not_to be_valid
      expect(line.errors.full_messages.join).to include("performance type")
    end
  end
end
