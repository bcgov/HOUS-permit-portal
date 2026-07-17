require "rails_helper"

RSpec.describe Part9StepCode::Checklist, type: :model do
  include ActiveSupport::Testing::TimeHelpers
  describe "associations" do
    it do
      should belong_to(:step_code)
               .class_name("Part9StepCode")
               .optional
               .touch(true)
    end
  end

  describe "#complete?" do
    it "returns true when status is complete" do
      checklist = build(:part_9_checklist, :marked_complete)

      expect(checklist.complete?).to be(true)
    end

    it "returns false when status is draft" do
      checklist = build(:part_9_checklist, status: :draft)

      expect(checklist.complete?).to be(false)
    end
  end

  describe "marking complete" do
    it "requires all relevant sections to be complete" do
      checklist = create(:part_9_checklist, status: :draft)

      expect(checklist.update(status: :complete)).to be(false)
      expect(checklist.errors[:base]).to include(
        "all relevant sections must be complete"
      )
    end

    it "allows complete status when all relevant sections are complete" do
      checklist = create(:part_9_checklist, :marked_complete)

      expect(checklist).to be_valid
      expect(checklist.complete?).to be(true)
    end
  end

  describe "stage_completed_at" do
    it "is set when the checklist becomes complete" do
      checklist =
        create(:part_9_checklist, status: :draft, stage_completed_at: nil)

      travel_to Time.zone.parse("2026-06-12 10:00") do
        checklist.update!(
          status: :complete,
          section_completion_status:
            Part9StepCode::Checklist.fully_complete_section_completion_status
        )
        expect(checklist.stage_completed_at).to eq(
          Time.zone.parse("2026-06-12 10:00")
        )
      end
    end

    it "is cleared when the checklist is no longer complete" do
      checklist =
        create(
          :part_9_checklist,
          :marked_complete,
          stage_completed_at: 1.day.ago
        )

      checklist.update!(status: :draft)
      expect(checklist.stage_completed_at).to be_nil
    end

    it "preserves the original completion timestamp on subsequent saves" do
      checklist =
        create(
          :part_9_checklist,
          :marked_complete,
          stage_completed_at: 2.days.ago
        )
      original_completed_at = checklist.stage_completed_at

      checklist.update!(completed_by: "Updated advisor")

      expect(checklist.reload.stage_completed_at).to eq(original_completed_at)
    end
  end

  describe "touching the parent Step Code" do
    it "updates Step Code updated_at when the checklist is saved" do
      step_code = create(:part_9_step_code)
      checklist = step_code.pre_construction_checklist
      step_code.update_column(:updated_at, 2.days.ago)
      original_updated_at = step_code.reload.updated_at

      travel_to 1.hour.from_now do
        checklist.update!(builder: "Touch test builder")
        expect(step_code.reload.updated_at).to be > original_updated_at
      end
    end

    it "updates Step Code updated_at when a data entry is saved" do
      step_code = create(:part_9_step_code)
      checklist = step_code.pre_construction_checklist
      step_code.update_column(:updated_at, 2.days.ago)
      original_updated_at = step_code.reload.updated_at

      travel_to 1.hour.from_now do
        Part9StepCode::DataEntry.create!(
          checklist: checklist,
          district_energy_ef: 9.99
        )
        expect(step_code.reload.updated_at).to be > original_updated_at
      end
    end
  end
end
