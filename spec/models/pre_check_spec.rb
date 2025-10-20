require "rails_helper"

RSpec.describe PreCheck, type: :model do
  describe "associations" do
    it { is_expected.to belong_to(:creator).class_name("User") }
    it { is_expected.to belong_to(:permit_application).optional }
    it { is_expected.to have_one(:permit_project).through(:permit_application) }
  end

  describe "validations" do
    it "ensures checklist defaults to sections array when blank" do
      pre_check = build(:pre_check, checklist: nil)

      expect(pre_check).to be_valid
      expect(pre_check.checklist).to eq({ "sections" => [] })
    end

    it "does not allow linking to a permit application the creator does not own" do
      permit_application = create(:permit_application)
      other_user = create(:user)

      pre_check =
        build(
          :pre_check,
          creator: other_user,
          permit_application: permit_application
        )

      expect(pre_check).not_to be_valid
      expect(pre_check.errors[:permit_application]).to include("is invalid")
    end
  end

  describe "search_data" do
    it "includes searchable attributes" do
      creator = create(:user)
      permit_project = create(:permit_project, title: "Delegated Title")
      permit_application =
        create(
          :permit_application,
          permit_project: permit_project,
          submitter: creator
        )
      pre_check =
        create(
          :pre_check,
          creator: creator,
          permit_application: permit_application
        )

      expect(pre_check.search_data).to include(
        id: pre_check.id,
        title: pre_check.title,
        certificate_no: pre_check.certificate_no,
        full_address: pre_check.full_address,
        permit_date: pre_check.permit_date,
        phase: pre_check.phase,
        creator_id: pre_check.creator_id,
        permit_project_id: pre_check.permit_project&.id,
        jurisdiction_id: pre_check.jurisdiction&.id,
        permit_application_id: pre_check.permit_application_id
      )
    end
  end

  describe "ProjectItem behavior" do
    it "delegates project fields from permit application" do
      creator = create(:user)
      permit_project = create(:permit_project, title: "My permit")
      permit_application =
        create(
          :permit_application,
          permit_project: permit_project,
          submitter: creator
        )
      pre_check =
        create(
          :pre_check,
          creator: creator,
          permit_application: permit_application,
          title: nil
        )

      expect(pre_check.title).to eq("My permit")
    end
  end
end
