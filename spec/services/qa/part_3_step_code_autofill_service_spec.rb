# frozen_string_literal: true

require "rails_helper"

RSpec.describe Qa::Part3StepCodeAutofillService do
  let(:submitter) { create(:user, :submitter) }
  let(:jurisdiction) do
    create(:sub_district, heating_degree_days: 4180, inbox_enabled: false)
  end
  let(:permit_application) do
    create(
      :permit_application,
      submitter: submitter,
      jurisdiction: jurisdiction
    )
  end
  let(:step_code) do
    create(
      :part_3_step_code,
      permit_application: permit_application,
      creator: submitter
    )
  end

  subject(:service) do
    described_class.new(step_code: step_code, current_user: submitter)
  end

  describe "#call" do
    before { service.call }

    let(:checklist) { step_code.reload.pre_construction_checklist }

    it "creates mixed-use occupancies" do
      expect(checklist.step_code_occupancies.pluck(:key)).to eq(["residential"])
      expect(checklist.baseline_occupancies.pluck(:key)).to eq(
        ["low_hazard_industrial"]
      )
    end

    it "populates fuel types and energy outputs" do
      expect(checklist.fuel_types.pluck(:key)).to match_array(
        %w[electricity natural_gas]
      )
      expect(checklist.reference_energy_outputs.count).to eq(2)
      expect(checklist.modelled_energy_outputs.count).to eq(9)
      expect(checklist.make_up_air_fuels.count).to eq(1)
      expect(checklist.document_references.count).to eq(3)
    end

    it "fills checklist scalar fields" do
      expect(checklist.heating_degree_days).to eq(4180)
      expect(checklist.total_annual_thermal_energy_demand.to_f).to eq(80_000)
      expect(checklist.completed_by_email).to eq("qa@example.com")
    end

    it "updates Step Code project details" do
      expect(step_code.full_address).to eq("123 QA Street, Victoria, BC")
      expect(step_code.reference_number).to eq("QA-REF-001")
      expect(step_code.pid).to eq("123456789")
      expect(step_code.jurisdiction).to eq(jurisdiction)
    end

    it "marks all relevant sections complete except the final section" do
      status = checklist.section_completion_status

      expect(status.dig("baseline_occupancies", "complete")).to be(true)
      expect(status.dig("step_code_occupancies", "complete")).to be(true)
      expect(status.dig("requirements_summary", "complete")).to be(true)
      expect(status.dig("step_code_summary", "complete")).to be(true)
      expect(status.dig("report", "complete")).to be(false)
      expect(status.dig("additional_fuel_types", "relevant")).to be(false)
      expect(status.dig("additional_fuel_types", "complete")).to be(true)
      expect(checklist.complete?).to be(false)
    end

    it "passes compliance checks" do
      compliance_summary =
        checklist.compliance_report.results.dig(
          :performance,
          :compliance_summary
        )

      expect(compliance_summary[:teui]).to be(true)
      expect(compliance_summary[:tedi]).to eq(
        whole_building: true,
        step_code_portion: true
      )
      expect(compliance_summary[:ghgi]).to be(true)
    end

    it "is idempotent when run again" do
      expect { service.call }.not_to change(
        Part3StepCode::OccupancyClassification,
        :count
      )
      expect(checklist.reload.step_code_occupancies.pluck(:key)).to eq(
        ["residential"]
      )
    end
  end

  describe "standalone Step Codes" do
    let!(:fallback_jurisdiction) do
      create(:sub_district, heating_degree_days: 4180, inbox_enabled: false)
    end
    let(:step_code) do
      create(:part_3_step_code, permit_application: nil, creator: submitter)
    end

    before { service.call }

    it "assigns a jurisdiction and pid" do
      expect(step_code.reload.jurisdiction).to eq(fallback_jurisdiction)
      expect(step_code.pid).to eq("123456789")
    end
  end
end
