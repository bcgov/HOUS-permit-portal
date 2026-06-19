require "rails_helper"

RSpec.describe Part3StepCode, type: :model do
  describe "#current_checklist" do
    it "returns the step code checklist" do
      step_code = build(:part_3_step_code)

      expect(step_code.current_checklist).to eq(step_code.checklist)
      expect(step_code.primary_checklist).to eq(step_code.current_checklist)
    end
  end
end
