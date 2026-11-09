require "rails_helper"

RSpec.describe ProjectAccess do
  let(:owner) { create(:user, :submitter) }
  let(:project) { create(:permit_project, owner: owner) }

  def access_for(user, level)
    create(
      :project_membership,
      permit_project: project,
      user: user,
      access: level
    )
    described_class.new(user, project.sandbox, project)
  end

  describe "a Full member" do
    subject(:access) { described_class.new(owner, project.sandbox, project) }

    it "can edit the project, manage people, and work on applications" do
      expect(access.level).to eq("full")
      expect(access.view_project?).to be true
      expect(access.edit_project?).to be true
      expect(access.archive_project?).to be true
      expect(access.pin_project?).to be true
      expect(access.invite_people?).to be true
      expect(access.manage_member_standing?).to be true
      expect(access.view_invitations?).to be true
      expect(access.add_application?).to be true
      expect(access.view_application?).to be true
      expect(access.edit_application?).to be true
      expect(access.submit_application?).to be true
      expect(access.delete_step_code?).to be true
      expect(access.manage_meetings?).to be true
      expect(access.view_project_notes?).to be true
      expect(access.view_activity?).to be true
      expect(access.assign_block?).to be false
      expect(access.assign_submit?).to be false
      expect(
        access.edit_role_tags?(ProjectMembership.new(access: :standard))
      ).to be true
      expect(access.archive_draft?(PermitApplication.new)).to be true
    end
  end

  describe "an Expanded member" do
    let(:user) { create(:user, :submitter) }
    subject(:access) { access_for(user, :expanded) }

    it "can work on applications and not on the project or member standing" do
      expect(access.view_project?).to be true
      expect(access.edit_project?).to be false
      expect(access.invite_people?).to be false
      expect(access.manage_member_standing?).to be false
      expect(access.view_invitations?).to be true
      expect(access.add_application?).to be true
      expect(access.view_application?).to be true
      expect(access.edit_application?).to be true
      expect(access.submit_application?).to be true
      expect(access.delete_step_code?).to be true
      expect(access.manage_meetings?).to be true
      expect(access.assign_block?).to be false
      expect(access.assign_submit?).to be false
    end

    it "edits role tags on themself and a Standard member" do
      standard = ProjectMembership.new(access: :standard)
      full =
        ProjectMembership.new(access: :full, user: create(:user, :submitter))

      expect(
        access.edit_role_tags?(
          ProjectMembership.new(access: :expanded, user: user)
        )
      ).to be true
      expect(access.edit_role_tags?(standard)).to be true
      expect(access.edit_role_tags?(full)).to be false
    end

    it "archives only a draft they created" do
      expect(
        access.archive_draft?(PermitApplication.new(created_by: user))
      ).to be true
      expect(
        access.archive_draft?(PermitApplication.new(created_by: owner))
      ).to be false
    end
  end

  describe "a Standard member" do
    subject(:access) { access_for(create(:user, :submitter), :standard) }

    it "can see the project and not its applications, invites, meetings, notes, or activity" do
      expect(access.view_project?).to be true
      expect(access.pin_project?).to be true
      expect(access.edit_project?).to be false
      expect(access.view_application?).to be false
      expect(access.edit_application?).to be false
      expect(access.add_application?).to be false
      expect(access.submit_application?).to be false
      expect(access.view_invitations?).to be false
      expect(access.manage_meetings?).to be false
      expect(access.view_project_notes?).to be false
      expect(access.view_activity?).to be false
      expect(access.delete_step_code?).to be false
    end
  end

  describe "no membership" do
    subject(:access) do
      described_class.new(create(:user, :submitter), project.sandbox, project)
    end

    it "denies every check" do
      expect(access.level).to be_nil
      expect(access.view_project?).to be false
      expect(access.to_h[:view_application]).to be false
      expect(access.to_h[:edit_project]).to be false
    end
  end

  it "ignores a membership when the project is in another sandbox" do
    jurisdiction = create(:sub_district)
    published = jurisdiction.sandboxes.published.first
    sandboxed =
      create(
        :permit_project,
        owner: owner,
        jurisdiction: jurisdiction,
        sandbox: published
      )

    expect(described_class.new(owner, nil, sandboxed).view_project?).to be false
    expect(
      described_class.new(owner, published, sandboxed).edit_project?
    ).to be true
  end

  describe ".levels and .member_sql" do
    it "follows the same answers as the instance checks" do
      accesses = ProjectMembership.accesses

      expect(described_class.levels(:view_project?)).to contain_exactly(
        accesses[:standard],
        accesses[:expanded],
        accesses[:full]
      )
      expect(described_class.levels(:edit_project?)).to eq([accesses[:full]])
      expect(described_class.levels(:view_application?)).to contain_exactly(
        accesses[:expanded],
        accesses[:full]
      )
      expect(described_class.levels(:assign_block?)).to eq([])
      expect(described_class.member_sql(:assign_block?)).to eq("FALSE")

      sql =
        described_class.member_sql(
          :view_application?,
          "permit_applications.permit_project_id"
        )
      expect(sql).to include("permit_applications.permit_project_id")
      expect(sql).to include(":uid")
      expect(sql).to include(
        "pm.access IN (#{accesses[:expanded]}, #{accesses[:full]})"
      )
    end
  end
end
