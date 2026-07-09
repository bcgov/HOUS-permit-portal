require "rails_helper"

RSpec.describe PermitApplication, type: :model do
  describe "associations" do
    subject { build_stubbed(:permit_application) }

    it { should belong_to(:submitter).class_name("User").optional }
    it { should belong_to(:permit_project).optional }
  end

  describe "enums" do
    subject { build_stubbed(:permit_application) }

    it do
      should define_enum_for(:status).with_values(
               new_draft: 0,
               newly_submitted: 1,
               in_review: 2,
               revisions_requested: 3,
               resubmitted: 4,
               approved: 5,
               issued: 6,
               withdrawn: 7
             )
    end
  end

  describe "#requires_project_meeting?" do
    let(:jurisdiction) { create(:sub_district) }
    let(:template_version) { create(:template_version) }
    let(:permit_application) do
      create(
        :permit_application,
        jurisdiction: jurisdiction,
        template_version: template_version
      )
    end

    it "returns true when its jurisdiction customization requires a project meeting" do
      create(
        :jurisdiction_template_version_customization,
        jurisdiction: jurisdiction,
        template_version: template_version,
        requires_project_meeting: true
      )

      expect(permit_application.requires_project_meeting?).to be(true)
    end

    it "returns false when the customization is for a different template" do
      create(
        :jurisdiction_template_version_customization,
        jurisdiction: jurisdiction,
        requires_project_meeting: true
      )

      expect(permit_application.requires_project_meeting?).to be(false)
    end
  end

  describe "Scopes" do
    # Create sandboxed and non-sandboxed permit applications
    let!(:jurisdiction) { create(:sub_district) }
    let!(:sandbox) { jurisdiction.sandboxes.published.first }
    let!(:sandboxed_application) do
      create(:permit_application, sandbox: sandbox, jurisdiction: jurisdiction)
    end
    let!(:live_application) do
      create(:permit_application, jurisdiction: jurisdiction)
    end

    describe ".all" do
      it "returns only non-sandboxed permit applications due to live scope" do
        expect(PermitApplication.live).to include(live_application)
        expect(PermitApplication.live).not_to include(sandboxed_application)
      end
    end

    describe ".sandboxed" do
      it "returns only sandboxed permit applications" do
        expect(PermitApplication.sandboxed).to include(sandboxed_application)
        expect(PermitApplication.sandboxed).not_to include(live_application)
      end
    end

    describe ".live" do
      it "returns only non-sandboxed permit applications" do
        expect(PermitApplication.live).to include(live_application)
        expect(PermitApplication.live).not_to include(sandboxed_application)
      end
    end

    describe "Default Scope" do
      it "includes all permit applications" do
        expect(PermitApplication.all).to include(sandboxed_application)
        expect(PermitApplication.all).to include(live_application)
      end
    end
  end

  describe "step_code_stage" do
    it "allows nil and StepCode::STAGES values" do
      permit_application = create(:permit_application, step_code_stage: nil)
      expect(permit_application).to be_valid

      permit_application.step_code_stage = "pre_construction"
      expect(permit_application).to be_valid

      permit_application.step_code_stage = "not_a_stage"
      expect(permit_application).not_to be_valid
      expect(permit_application.errors[:step_code_stage]).to be_present
    end

    describe "#step_code_checklist and #step_code_complete?" do
      it "resolves the checklist for the permit-pinned stage, not StepCode.current_stage" do
        permit_application = create(:permit_application)
        step_code =
          create(:part_3_step_code, permit_application: permit_application)
        pre_construction = step_code.pre_construction_checklist
        pre_construction.update!(
          section_completion_status: {
            "step_code_summary" => {
              "complete" => true,
              "relevant" => true
            }
          }
        )
        create(:part_3_checklist, step_code: step_code, stage: :as_built)
        step_code.update!(current_stage: "as_built")
        permit_application.update!(step_code_stage: "pre_construction")

        expect(permit_application.step_code_checklist).to eq(pre_construction)
        expect(permit_application.step_code_complete?).to be(true)
        expect(step_code.complete?).to be(false)
      end

      it "falls back to current_checklist when step_code_stage is nil" do
        permit_application = create(:permit_application, step_code_stage: nil)
        step_code =
          create(:part_3_step_code, permit_application: permit_application)
        as_built =
          create(:part_3_checklist, step_code: step_code, stage: :as_built)
        step_code.update!(current_stage: "as_built")
        permit_application.reload

        # Attach callback may have set step_code_stage; clear it for this case.
        permit_application.update_column(:step_code_stage, nil)

        expect(permit_application.step_code_checklist).to eq(as_built)
      end
    end

    describe "#ensure_step_code_stage!" do
      it "sets step_code_stage from the step code when blank" do
        permit_application = create(:permit_application, step_code_stage: nil)
        step_code =
          create(
            :part_3_step_code,
            permit_application: nil,
            current_stage: "mid_construction"
          )

        step_code.update!(permit_application: permit_application)

        expect(permit_application.reload.step_code_stage).to eq(
          "mid_construction"
        )
      end

      it "does not overwrite an existing pin" do
        permit_application =
          create(:permit_application, step_code_stage: "pre_construction")
        step_code =
          create(
            :part_3_step_code,
            permit_application: nil,
            current_stage: "as_built"
          )

        step_code.update!(permit_application: permit_application)

        expect(permit_application.reload.step_code_stage).to eq(
          "pre_construction"
        )
      end
    end

    describe "submission snapshot" do
      it "snapshots the permit-pinned checklist" do
        permit_application = create(:permit_application)
        step_code =
          create(:part_3_step_code, permit_application: permit_application)
        pre_construction = step_code.pre_construction_checklist
        create(:part_3_checklist, step_code: step_code, stage: :as_built)
        step_code.update!(current_stage: "as_built")
        permit_application.update!(step_code_stage: "pre_construction")

        allow(permit_application).to receive(
          :zip_and_upload_supporting_documents
        )
        allow(permit_application).to receive(:send_submit_notifications)
        allow(permit_application).to receive(:form_json).and_return(
          { "components" => [] }
        )

        permit_application.send(:handle_submission)

        snapshot =
          permit_application.submission_versions.last.step_code_checklist_json
        expect(snapshot["id"]).to eq(pre_construction.id)
        expect(snapshot["stage"]).to eq("pre_construction")
      end
    end
  end
end
