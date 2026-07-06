require "rails_helper"

RSpec.describe StepCodeBlueprint do
  describe "stage_completions" do
    it "returns not started, in progress, and complete statuses with completion dates" do
      step_code = create(:part_9_step_code)
      pre_construction = step_code.pre_construction_checklist
      pre_construction.update!(
        status: :complete,
        stage_completed_at: Time.zone.parse("2026-06-12 10:00")
      )
      step_code.find_or_create_checklist_for!(stage: :mid_construction)

      payload =
        StepCodeBlueprint.render_as_hash(step_code, view: :default)[
          :stage_completions
        ]

      expect(payload).to eq(
        [
          {
            stage: "pre_construction",
            status: "complete",
            stage_completed_at: pre_construction.stage_completed_at.iso8601
          },
          {
            stage: "mid_construction",
            status: "in_progress",
            stage_completed_at: nil
          },
          { stage: "as_built", status: "not_started", stage_completed_at: nil }
        ]
      )
    end
  end
end
