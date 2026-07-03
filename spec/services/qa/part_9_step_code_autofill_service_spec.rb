# frozen_string_literal: true

require "rails_helper"

RSpec.describe Qa::Part9StepCodeAutofillService do
  let(:submitter) { create(:user, :submitter) }
  let(:jurisdiction) { create(:sub_district, inbox_enabled: false) }
  let(:permit_application) do
    create(
      :permit_application,
      submitter: submitter,
      jurisdiction: jurisdiction,
      with_fake_plan_document: true
    )
  end
  let(:step_code) do
    create(
      :part_9_step_code,
      permit_application: permit_application,
      creator: submitter
    )
  end
  let!(:step_requirement) do
    JurisdictionStepRequirement.create!(
      jurisdiction: jurisdiction,
      energy_step_required: 3,
      zero_carbon_step_required: 2
    )
  end

  subject(:service) do
    described_class.new(step_code: step_code, current_user: submitter)
  end

  before do
    StepCode::Part9::MEUIReferencesSeeder.seed!
    StepCode::Part9::TEDIReferencesSeeder.seed!
  end

  describe "#call" do
    before { service.call }

    let(:checklist) { step_code.reload.pre_construction_checklist }

    it "uploads and parses the H2K fixture" do
      data_entry = checklist.data_entries.first

      expect(checklist.data_entries.count).to eq(1)
      expect(data_entry.h2k_file_data).to be_present
      expect(data_entry.model).to eq("HOT2000")
      expect(data_entry.hdd).to eq(2851)
    end

    it "fills checklist scalar fields" do
      expect(checklist.compliance_path).to eq("step_code_ers")
      expect(checklist.building_type).to eq("single_detached")
      expect(checklist.completed_by_email).to eq("qa@example.com")
      expect(checklist.epc_calculation_compliance).to be(true)
    end

    it "populates building characteristics" do
      summary = checklist.building_characteristics_summary

      expect(summary.roof_ceilings_lines.first.details).to eq("Roof")
      expect(summary.doors_lines.first.details).to eq("Door")
    end

    it "selects a step requirement" do
      expect(checklist.step_requirement_id).to eq(step_requirement.id)
    end

    it "updates step code project details" do
      expect(step_code.full_address).to eq("123 QA Street, Victoria, BC")
      expect(step_code.reference_number).to eq("QA-REF-001")
      expect(step_code.pid).to eq("123456789")
      expect(step_code.jurisdiction).to eq(jurisdiction)
    end

    it "marks all sections complete except the final section" do
      status = checklist.section_completion_status

      expect(status.dig("h2k_import", "complete")).to be(true)
      expect(status.dig("review", "complete")).to be(true)
      expect(status.dig("report", "complete")).to be(false)
      expect(checklist.complete?).to be(false)
    end

    it "has passing compliance reports" do
      expect(checklist.passing_compliance_reports).not_to be_empty
    end

    it "is idempotent when run again" do
      expect { service.call }.not_to change(Part9StepCode::DataEntry, :count)
      expect(checklist.reload.data_entries.count).to eq(1)
      expect(checklist.step_requirement_id).to eq(step_requirement.id)
    end
  end

  describe "standalone step codes" do
    let(:step_code) do
      create(:part_9_step_code, permit_application: nil, creator: submitter)
    end

    before { service.call }

    it "assigns a jurisdiction and pid" do
      expect(step_code.reload.jurisdiction).to eq(jurisdiction)
      expect(step_code.pid).to eq("123456789")
    end
  end
end
