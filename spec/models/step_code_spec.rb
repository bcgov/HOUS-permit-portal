require "rails_helper"

RSpec.describe StepCode, type: :model do
  describe "validations" do
    it "enforces uniqueness of kept permit application Step Codes" do
      permit_application = create(:permit_application)

      Part3StepCode.create!(
        permit_application: permit_application,
        creator: create(:user)
      )
      duplicate =
        Part3StepCode.new(
          permit_application: permit_application,
          creator: create(:user)
        )

      expect(duplicate).not_to be_valid
      expect(duplicate.errors[:permit_application_id]).to be_present
    end
  end

  describe "#search_data" do
    it "includes core permit application fields" do
      permit_application = create(:permit_application)
      step_code =
        Part3StepCode.create!(
          permit_application: permit_application,
          creator: create(:user)
        )

      data = step_code.search_data

      expect(data[:id]).to eq(step_code.id)
      expect(data[:type]).to eq(step_code.type)
      expect(data[:permit_project_id]).to eq(step_code.permit_project&.id)
      expect(data[:jurisdiction_id]).to eq(step_code.jurisdiction&.id)
      expect(data[:permit_date]).to eq(permit_application.permit_date)
    end
  end

  describe "#permit_date" do
    it "uses the attached permit application's issued_at, not the step code column" do
      permit_application =
        create(:permit_application, issued_at: Time.zone.parse("2026-08-19"))
      step_code =
        Part3StepCode.create!(
          permit_application: permit_application,
          creator: create(:user),
          permit_date: Date.new(2020, 1, 1)
        )

      expect(step_code.permit_date).to eq(Date.new(2026, 8, 19))
    end

    it "uses the step code column when detached" do
      step_code = create(:part_9_step_code, permit_date: Date.new(2020, 1, 1))

      expect(step_code.permit_date).to eq(Date.new(2020, 1, 1))
    end
  end

  describe "#generate_report_document" do
    it "enqueues a report generation job" do
      step_code = create(:part_9_step_code)

      expect(StepCodeReportGenerationJob).to receive(:perform_async).with(
        step_code.id
      )

      step_code.generate_report_document
    end
  end

  describe "abstract interface" do
    it "raises for base class methods" do
      step_code = described_class.new

      expect { step_code.complete? }.to raise_error(NotImplementedError)
      expect { step_code.current_checklist }.to raise_error(NotImplementedError)
      expect { step_code.blueprint }.to raise_error(NotImplementedError)
      expect { step_code.checklist_blueprint }.to raise_error(
        NotImplementedError
      )
    end
  end

  describe "climate zone mapping" do
    it "handles boundary HDD values" do
      expect(
        StepCode::Part3::V0::Requirements::References::ClimateZone.value(2999)
      ).to eq("zone_4")
      expect(
        StepCode::Part3::V0::Requirements::References::ClimateZone.value(3000)
      ).to eq("zone_5")
      expect(
        StepCode::Part3::V0::Requirements::References::ClimateZone.value(7000)
      ).to eq("zone_8")
    end
  end
end
