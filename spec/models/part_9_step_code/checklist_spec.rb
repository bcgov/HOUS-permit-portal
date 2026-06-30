require "rails_helper"

RSpec.describe Part9StepCode::Checklist, type: :model do
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
      checklist = build(:part_9_checklist, status: :complete)

      expect(checklist.complete?).to be(true)
    end

    it "returns false when status is draft" do
      checklist = build(:part_9_checklist, status: :draft)

      expect(checklist.complete?).to be(false)
    end
  end

  describe "touching the parent step code" do
    it "updates step code updated_at when the checklist is saved" do
      step_code = create(:part_9_step_code)
      checklist = step_code.pre_construction_checklist
      step_code.update_column(:updated_at, 2.days.ago)
      original_updated_at = step_code.reload.updated_at

      travel_to 1.hour.from_now do
        checklist.update!(builder: "Touch test builder")
        expect(step_code.reload.updated_at).to be > original_updated_at
      end
    end

    it "updates step code updated_at when a data entry is saved" do
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
