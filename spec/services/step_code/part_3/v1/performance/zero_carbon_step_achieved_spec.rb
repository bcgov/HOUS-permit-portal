RSpec.describe StepCode::Part3::V1::Performance::ZeroCarbonStepAchieved do
  describe "step proposal behavior" do
    let(:checklist) { create(:part_3_checklist) }
    let(:requirements) { { whole_building: { ghgi: 2.0 } } }

    it "uses ghgi checker and configured step range" do
      allow(ENV).to receive(:[]).and_call_original
      allow(ENV).to receive(:[]).with("PART_3_MIN_ZERO_CARBON_STEP").and_return(
        "1"
      )
      allow(ENV).to receive(:[]).with("PART_3_MAX_ZERO_CARBON_STEP").and_return(
        "4"
      )

      result =
        described_class.new(
          checklist: checklist,
          min_required_step: 1,
          performance_results: {
            ghgi: 1.0
          },
          requirements: requirements
        ).call

      expect(result.step).to eq(4)
    end

    it "returns checker requirements status as expected" do
      checker =
        described_class.new(
          checklist: checklist,
          min_required_step: 1,
          performance_results: {
            ghgi: 3.0
          },
          requirements: requirements
        )

      expect(checker.ghgi_checker.requirements_met?).to be(false)
    end
  end
end
