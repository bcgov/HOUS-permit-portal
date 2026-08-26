require "rails_helper"

RSpec.describe Part9StepCode, type: :model do
  # We do not enforce that permit_applications must be present to reserve room for Step Code model with no permit application, therefore we do not do it { should belong_to(:permit_application) }

  let!(:permit_application) { create(:permit_application) }
  let!(:step_code) do
    build(:part_9_step_code, permit_application: permit_application)
  end

  before :each do
    allow(permit_application).to receive(:architectural_drawing_plan_field) {
      "formSubmissionDataRSTsection422ad829-55d0-4677-b93b-ada73a3d2e0b|RB60d1b79c-02e9-430b-97e0-aaac8a0277e4|test_file"
    }
  end

  describe "#current_checklist" do
    it "returns the checklist for the current stage" do
      step_code = create(:part_9_step_code)
      mid_construction_checklist =
        create(
          :part_9_checklist,
          step_code: step_code,
          stage: :mid_construction
        )
      step_code.update!(current_stage: "mid_construction")

      expect(step_code.current_checklist).to eq(mid_construction_checklist)
    end
  end

  describe "#find_or_create_checklist_for!" do
    it "clones values from the nearest previous stage" do
      step_code = create(:part_9_step_code)
      pre_construction = step_code.pre_construction_checklist
      pre_construction.update!(
        builder: "Original builder",
        compliance_path: "step_code_ers"
      )
      Part9StepCode::DataEntry.create!(
        checklist: pre_construction,
        district_energy_ef: 1.23
      )

      as_built = step_code.find_or_create_checklist_for!(stage: "as_built")

      expect(as_built.builder).to eq("Original builder")
      expect(as_built.compliance_path).to eq("step_code_ers")
      expect(as_built.section_completion_status.dig("start", "complete")).to be(
        false
      )
      expect(as_built.data_entries.count).to eq(1)
      expect(as_built.data_entries.first.district_energy_ef).to eq(
        BigDecimal("1.23")
      )
    end

    it "returns an existing checklist for the requested stage" do
      step_code = create(:part_9_step_code)
      existing =
        create(
          :part_9_checklist,
          step_code: step_code,
          stage: :mid_construction
        )

      result =
        step_code.find_or_create_checklist_for!(stage: "mid_construction")

      expect(result).to eq(existing)
      expect(step_code.checklists.mid_construction.count).to eq(1)
    end
  end

  describe "#process_current_h2k_files" do
    let(:step_code) { create(:part_9_step_code) }
    let(:checklist) { step_code.pre_construction_checklist }
    let(:fixture_path) { Rails.root.join("spec/support/Test Model side 1.h2k") }

    before do
      uploaded_file =
        File.open(fixture_path) do |file|
          H2kFileUploader.upload(file, :store, metadata: false)
        end
      uploaded_file.metadata.merge!(
        "filename" => File.basename(fixture_path),
        "size" => File.size(fixture_path),
        "mime_type" => "application/octet-stream"
      )
      checklist.data_entries.create!(h2k_file_data: uploaded_file.data)
    end

    it "populates the building characteristics summary from uploaded H2K files" do
      step_code.process_current_h2k_files(checklist)

      summary = checklist.reload.building_characteristics_summary
      expect(summary.roof_ceilings_lines.map(&:details)).to include(
        "Ceiling - 1 - 2x10 @ 24 R28 spray foam"
      )
      expect(summary.above_grade_walls_lines.map(&:details)).to include(
        "Main - 2x6 @ 24 R24 Siding"
      )
      expect(summary.hot_water_lines.first.details).to eq(
        "Domestic hot water - Electricity - Conserver tank"
      )
      expect(summary.fossil_fuels.presence).to eq("yes")
    end

    it "overwrites H2K-mapped fields on re-import without duplicating rows" do
      step_code.process_current_h2k_files(checklist)
      summary = checklist.reload.building_characteristics_summary
      roof_count = summary.roof_ceilings_lines.count
      summary.update!(
        airtightness: {
          details: "Manual air barrier"
        },
        ventilation_lines: [
          { details: "Stale HRV", percent_eff: 50, liters_per_sec: 10 }
        ]
      )

      step_code.process_current_h2k_files(checklist)

      summary.reload
      expect(summary.roof_ceilings_lines.count).to eq(roof_count)
      expect(summary.airtightness.details).not_to eq("Manual air barrier")
      expect(summary.ventilation_lines.map(&:details)).not_to include(
        "Stale HRV"
      )
      expect(summary.ventilation_lines.map(&:details)).to include("HRV - VanEE")
    end
  end

  context "permit_applications" do
    it "invalid on create if there is no supporting doc with compliance" do
      expect(step_code.valid?).to eq false
    end

    context "supporting doc validator fails" do
      let!(:supporting_doc_with_compliance) do
        create(
          :supporting_document,
          data_key:
            "formSubmissionDataRSTsection422ad829-55d0-4677-b93b-ada73a3d2e0b|RB60d1b79c-02e9-430b-97e0-aaac8a0277e4|test_file",
          permit_application: permit_application,
          compliance_data: {
            status: "failed",
            error:
              "Unable to run digital seal validator integration - Failed to open TCP connection to consigno-verifio-notarius-server:80 (No route to host - connect(2) for \"consigno-verifio-notarius-server\" port 80)"
          }
        )
      end

      before :each do
        expect_any_instance_of(PermitApplication).to receive(
          :active_supporting_documents
        ).and_return(SupportingDocument.all)
      end

      # This is true for Part 9, but may need to change for Part 3
      it "is still valid" do
        step_code.save
        step_code.valid?
      end

      # it "is invalid if it is part 3" do
      #   step_code.save
      #   expect(step_code.errors.full_messages).to eq(
      #     ["Plan version file uploaded failed to verify author and data due to an error with the serivce."],
      #   )
      # end
    end

    context "has supporting doc with compliance" do
      let!(:supporting_doc_with_compliance) do
        create(
          :supporting_document,
          data_key:
            "formSubmissionDataRSTsection422ad829-55d0-4677-b93b-ada73a3d2e0b|RB60d1b79c-02e9-430b-97e0-aaac8a0277e4|test_file",
          permit_application: permit_application,
          compliance_data: {
            status: "success",
            result: SIGNATURE_RESPONSE_STUB
          }
        )
      end

      before :each do
        expect_any_instance_of(PermitApplication).to receive(
          :active_supporting_documents
        ).and_return(SupportingDocument.all)
      end

      it "sets the Step Code plan values if there is a supporting doc with compliance" do
        expect(step_code.valid?).to eq true
      end

      it "sets plan fields" do
        step_code.save
        expect(step_code.plan_author).to eq("Test - H2 -- Notarius")
      end
    end
  end
end
