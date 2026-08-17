require "rails_helper"

RSpec.describe ProjectPermissions, type: :model do
  let(:owner) { create(:user, :submitter) }
  let(:member) { create(:user, :submitter) }
  let!(:permit_project) { create(:permit_project, owner: owner) }

  def team(kind)
    permit_project.project_teams.find_by(kind: kind)
  end

  describe "auto teams" do
    it "creates the three auto teams with the default access levels" do
      expect(permit_project.project_teams.pluck(:kind)).to match_array(
        %w[leads contributors all_members]
      )

      expect(team(:leads).project_access).to eq("edit")
      expect(team(:leads).collaborator_access).to eq("manage")
      expect(team(:leads).team_access).to eq("manage")

      expect(team(:contributors).project_access).to eq("none")
      expect(team(:all_members).project_access).to eq("none")
    end
  end

  describe "#permissions_for" do
    it "locks the owner at the maximum of every domain" do
      permissions = permit_project.permissions_for(owner)

      expect(permissions.project_edit?).to be true
      expect(permissions.collaborators_manage?).to be true
      expect(permissions.teams_manage?).to be true
      expect(permissions).to eq(described_class.owner)
    end

    it "grants nothing to a user with no membership" do
      expect(permit_project.permissions_for(member).project_read?).to be false
      expect(permit_project.permissions_for(nil).project_read?).to be false
    end

    it "grants nothing to a contributor while the contributor team has none" do
      create(
        :project_membership,
        permit_project:,
        user: member,
        role: :contributor
      )

      permissions = permit_project.permissions_for(member)
      expect(permissions.project_read?).to be false
      expect(permissions.collaborators_view?).to be false
      expect(permissions.teams_view?).to be false
    end

    it "gives a lead the leads team permissions" do
      create(:project_membership, permit_project:, user: member, role: :lead)

      permissions = permit_project.permissions_for(member)
      expect(permissions.project_edit?).to be true
      expect(permissions.collaborators_manage?).to be true
      expect(permissions.teams_manage?).to be true
    end

    it "takes the per-domain max across the role team and all_members" do
      create(
        :project_membership,
        permit_project:,
        user: member,
        role: :contributor
      )
      team(:all_members).update!(collaborator_access: :view)
      team(:contributors).update!(project_access: :read)
      permit_project.reload

      permissions = permit_project.permissions_for(member)
      expect(permissions.project_read?).to be true
      expect(permissions.project_edit?).to be false
      expect(permissions.collaborators_view?).to be true
      expect(permissions.collaborators_invite?).to be false
    end

    it "does not leak a team's permissions to the other role" do
      create(
        :project_membership,
        permit_project:,
        user: member,
        role: :contributor
      )
      team(:leads).update!(project_access: :edit)
      permit_project.reload

      expect(permit_project.permissions_for(member).project_read?).to be false
    end

    # ponytail bridge: remove alongside the legacy submission collaborations.
    it "grants read to a legacy submission collaborator with no membership" do
      permit_application =
        create(:permit_application, permit_project:, submitter: owner)
      collaborator =
        create(:collaborator, user: member, collaboratorable: owner)
      create(
        :permit_collaboration,
        :submission,
        :delegatee,
        collaborator: collaborator,
        permit_application: permit_application
      )
      permit_project.reload

      permissions = permit_project.permissions_for(member)
      expect(permissions.project_read?).to be true
      expect(permissions.project_edit?).to be false
    end
  end

  describe "#readable_user_ids" do
    it "includes the owner and members whose teams grant read" do
      lead = create(:user, :submitter)
      contributor = create(:user, :submitter)
      create(:project_membership, permit_project:, user: lead, role: :lead)
      create(
        :project_membership,
        permit_project:,
        user: contributor,
        role: :contributor
      )
      permit_project.reload

      expect(permit_project.readable_user_ids).to match_array(
        [owner.id, lead.id]
      )

      permit_project
        .project_teams
        .find_by(kind: :all_members)
        .update!(project_access: :read)
      permit_project.reload

      expect(permit_project.readable_user_ids).to match_array(
        [owner.id, lead.id, contributor.id]
      )
    end
  end

  describe "levels" do
    it "reports higher levels as satisfying lower ones" do
      permissions =
        described_class.none.at_least(
          project_access: :edit,
          collaborator_access: :manage
        )

      expect(permissions.project_read?).to be true
      expect(permissions.collaborators_invite?).to be true
      expect(permissions.teams_view?).to be false
    end

    it "never lowers a level" do
      permissions =
        described_class
          .none
          .at_least(project_access: :edit)
          .at_least(project_access: :read)

      expect(permissions.project_edit?).to be true
    end

    it "serializes level names for the API" do
      expect(described_class.none.to_h).to eq(
        project_access: "none",
        collaborator_access: "none",
        team_access: "none"
      )
      expect(described_class.owner.to_h).to eq(
        project_access: "edit",
        collaborator_access: "manage",
        team_access: "manage"
      )
    end
  end
end
