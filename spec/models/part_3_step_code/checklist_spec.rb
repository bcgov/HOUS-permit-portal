require "rails_helper"

RSpec.describe Part3StepCode::Checklist, type: :model do
  include ActiveSupport::Testing::TimeHelpers
  describe "associations" do
    it do
      should belong_to(:step_code)
               .class_name("Part3StepCode")
               .optional
               .touch(true)
    end
  end

  describe "touching the parent step code" do
    it "updates step code updated_at when the checklist is saved" do
      step_code = create(:part_3_step_code)
      checklist = step_code.pre_construction_checklist
      step_code.update_column(:updated_at, 2.days.ago)
      original_updated_at = step_code.reload.updated_at

      travel_to 1.hour.from_now do
        checklist.update!(completed_by_email: "touch-test@example.com")
        expect(step_code.reload.updated_at).to be > original_updated_at
      end
    end
  end

  describe "#complete?" do
    it "returns true when the summary section is complete" do
      checklist =
        build(
          :part_3_checklist,
          section_completion_status: {
            "step_code_summary" => {
              "complete" => true
            }
          }
        )

      expect(checklist.complete?).to be(true)
    end

    it "returns false when the summary section is incomplete" do
      checklist = build(:part_3_checklist)

      expect(checklist.complete?).to be(false)
    end
  end

  describe "stage_completed_at" do
    it "is set when the checklist becomes complete" do
      checklist = create(:part_3_checklist)

      travel_to Time.zone.parse("2026-06-12 10:00") do
        checklist.update!(
          section_completion_status: {
            "step_code_summary" => {
              "complete" => true,
              "relevant" => true
            }
          }
        )
        expect(checklist.stage_completed_at).to eq(
          Time.zone.parse("2026-06-12 10:00")
        )
      end
    end

    it "is cleared when the summary section is no longer complete" do
      checklist =
        create(
          :part_3_checklist,
          section_completion_status: {
            "step_code_summary" => {
              "complete" => true,
              "relevant" => true
            }
          },
          stage_completed_at: 1.day.ago
        )

      checklist.update!(
        section_completion_status: {
          "step_code_summary" => {
            "complete" => false,
            "relevant" => true
          }
        }
      )

      expect(checklist.stage_completed_at).to be_nil
    end
  end

  describe "compliance_metrics" do
    let(:checklist) do
      create(:part_3_checklist, occupancy_classifications: occupancies)
    end

    context "when the checklist has step code occupancies" do
      let(:occupancies) do
        build_list(:step_code_occupancy, 1, :other_residential)
      end

      it "returns the correct metrics" do
        expect(checklist.compliance_metrics).to contain_exactly(
          :teui,
          :tedi,
          :ghgi
        )
      end
    end

    context "when the checklist does not have step code occupancies" do
      let(:occupancies) { build_list(:step_code_occupancy, 1, :low_industrial) }

      it "returns the correct metrics" do
        expect(checklist.compliance_metrics).to contain_exactly(:total_energy)
      end
    end
  end
end
