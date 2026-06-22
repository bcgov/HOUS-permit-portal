require "rails_helper"

RSpec.describe Part3StepCode, type: :model do
  describe "#current_checklist" do
    it "returns the checklist for the current stage" do
      step_code = create(:part_3_step_code)
      as_built_checklist =
        create(:part_3_checklist, step_code: step_code, stage: :as_built)
      step_code.update!(current_stage: "as_built")

      expect(step_code.current_checklist).to eq(as_built_checklist)
      expect(step_code.primary_checklist).to eq(step_code.current_checklist)
    end
  end
end
