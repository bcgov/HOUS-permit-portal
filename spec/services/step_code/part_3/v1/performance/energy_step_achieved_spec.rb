RSpec.describe StepCode::Part3::V1::Performance::EnergyStepAchieved do
  describe "step proposal behavior" do
    let(:checklist) { create(:part_3_checklist) }
    let(:requirements) do
      {
        whole_building: {
          teui: 120,
          tedi: 35
        },
        step_code_portions: {
          area_weighted_totals: {
            tedi: 35
          }
        }
      }
    end

    it "uses tedi and teui checkers to propose the max passing step" do
      allow(ENV).to receive(:[]).and_call_original
      allow(ENV).to receive(:[]).with("PART_3_MIN_ENERGY_STEP").and_return("2")
      allow(ENV).to receive(:[]).with("PART_3_MAX_ENERGY_STEP").and_return("4")

      result =
        described_class.new(
          checklist: checklist,
          min_required_step: 2,
          performance_results: {
            teui: 100,
            tedi: {
              whole_building: 30,
              step_code_portion: 30
            }
          },
          requirements: requirements
        ).call

      expect(result.step).to eq(4)
    end

    it "returns checker requirements status as expected" do
      checker =
        described_class.new(
          checklist: checklist,
          min_required_step: 2,
          performance_results: {
            teui: 130,
            tedi: {
              whole_building: 30,
              step_code_portion: 30
            }
          },
          requirements: requirements
        )

      expect(checker.tedi_checker.requirements_met?).to be(true)
      expect(checker.step_code_tedi_checker.requirements_met?).to be(true)
      expect(checker.teui_checker.requirements_met?).to be(false)
    end
  end
end
