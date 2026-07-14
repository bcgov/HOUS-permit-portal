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

  describe "versioned template metadata" do
    it "uses the selected version snapshot after the live template changes" do
      requirement_template =
        create(:requirement_template, nickname: "Original template")
      template_version =
        create(
          :template_version,
          requirement_template: requirement_template,
          snapshot_json: {
            "schema_version" => 1,
            "template" => {
              "id" => requirement_template.id,
              "nickname" => "Snapshot template",
              "tags" => ["snapshot-tag"]
            },
            "sections" => [],
            "blocks" => {
            }
          }
        )
      requirement_template.update!(
        nickname: "Updated live template",
        tag_list: ["live-tag"]
      )
      permit_application =
        build(
          :permit_application,
          nickname: nil,
          template_version: template_version
        )

      permit_application.valid?

      expect(permit_application.template_nickname).to eq("Snapshot template")
      expect(permit_application.template_tag_list).to eq(["snapshot-tag"])
      expect(permit_application.nickname).to eq("Snapshot template")
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

  # describe "validations" do
  #   context "with an invalid submitter" do
  #     let(:submitter) { create(:user, role: :reviewer) }
  #     let(:permit_application) { build(:permit_application, submitter: submitter) }

  #     it "is not valid" do
  #       expect(permit_application).not_to be_valid
  #       expect(permit_application.errors[:submitter]).to include("must have the submitter role")
  #     end
  #   end
  # end
end
