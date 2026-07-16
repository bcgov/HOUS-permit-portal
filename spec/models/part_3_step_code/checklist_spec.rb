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
    it "returns true when status is complete" do
      checklist = build(:part_3_checklist, :marked_complete)

      expect(checklist.complete?).to be(true)
    end

    it "returns false when status is draft" do
      checklist = build(:part_3_checklist)

      expect(checklist.complete?).to be(false)
    end
  end

  describe "marking complete" do
    it "requires all relevant sections to be complete" do
      checklist = create(:part_3_checklist, status: :draft)

      expect(checklist.update(status: :complete)).to be(false)
      expect(checklist.errors[:base]).to include(
        "all relevant sections must be complete"
      )
    end

    it "allows complete status when all relevant sections are complete" do
      checklist = create(:part_3_checklist, :marked_complete)

      expect(checklist).to be_valid
      expect(checklist.complete?).to be(true)
    end
  end

  describe "stage_completed_at" do
    it "is set when the checklist becomes complete" do
      checklist = create(:part_3_checklist)

      travel_to Time.zone.parse("2026-06-12 10:00") do
        checklist.update!(
          status: :complete,
          section_completion_status:
            Part3StepCode::Checklist.fully_complete_section_completion_status
        )
        expect(checklist.stage_completed_at).to eq(
          Time.zone.parse("2026-06-12 10:00")
        )
      end
    end

    it "is cleared when the checklist is no longer complete" do
      checklist =
        create(
          :part_3_checklist,
          :marked_complete,
          stage_completed_at: 1.day.ago
        )

      checklist.update!(status: :draft)

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

  describe "report staleness" do
    it "marks existing report documents stale when the checklist is updated" do
      step_code = create(:part_3_step_code)
      checklist = step_code.pre_construction_checklist
      report = create(:report_document, step_code: step_code, stale: false)

      checklist.update!(completed_by_email: "energy@example.com")

      expect(report.reload.stale).to be(true)
    end

    it "does not auto-enqueue report generation when a complete checklist is updated" do
      step_code = create(:part_3_step_code)
      checklist = step_code.pre_construction_checklist
      checklist.update!(
        status: :complete,
        section_completion_status:
          Part3StepCode::Checklist.fully_complete_section_completion_status
      )

      expect(StepCodeReportGenerationJob).not_to receive(:perform_async)

      checklist.update!(completed_by_email: "energy@example.com")
    end
  end
end
