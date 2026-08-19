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
      expect(team(:leads).meeting_access).to eq("manage")

      expect(team(:contributors).project_access).to eq("base")
      expect(team(:all_members).project_access).to eq("base")
    end

    it "cannot be renamed, converted to a custom team, or destroyed" do
      leads = team(:leads)

      expect(leads.update(name: "Bosses")).to be false
      expect(leads.update(kind: :custom, name: "Bosses")).to be false
      expect(leads.destroy).to be false
      expect(leads.reload.name).to eq("Leads")
      expect(leads.kind).to eq("leads")
    end

    it "still accepts permission changes" do
      expect(team(:contributors).update(project_access: :read)).to be true
    end
  end

  describe "#permissions_for" do
    it "locks the owner at the maximum of every domain" do
      permissions = permit_project.permissions_for(owner)

      expect(permissions.project_edit?).to be true
      expect(permissions.collaborators_manage?).to be true
      expect(permissions.meetings_manage?).to be true
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
      expect(permissions.meetings_view?).to be false
    end

    it "gives a lead the leads team permissions" do
      create(:project_membership, permit_project:, user: member, role: :lead)

      permissions = permit_project.permissions_for(member)
      expect(permissions.project_edit?).to be true
      expect(permissions.collaborators_manage?).to be true
      expect(permissions.meetings_manage?).to be true
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
      expect(permissions.collaborators_manage?).to be false
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

    # COLLAB TODO(phase 5): remove alongside the legacy submission collaborations.
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
    it "includes the owner and every kept member" do
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
        [owner.id, lead.id, contributor.id]
      )
    end

    it "excludes pending invites" do
      create(
        :project_membership,
        :pending,
        permit_project:,
        invited_email: member.email
      )

      expect(permit_project.readable_user_ids).to eq([owner.id])
    end
  end

  describe "levels" do
    it "reports higher levels as satisfying lower ones" do
      permissions =
        described_class.none.at_least(
          project_access: :edit,
          collaborator_access: :manage,
          meeting_access: :manage
        )

      expect(permissions.project_read?).to be true
      expect(permissions.collaborators_view?).to be true
      expect(permissions.meetings_view?).to be true
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
        project_access: "base",
        collaborator_access: "none",
        meeting_access: "none"
      )
      expect(described_class.owner.to_h).to eq(
        project_access: "edit",
        collaborator_access: "manage",
        meeting_access: "manage"
      )
    end
  end

  describe "custom teams" do
    let(:custom_team) do
      permit_project.project_teams.create!(
        name: "Plumbers",
        kind: :custom,
        project_access: :read
      )
    end

    it "grants its permissions only to its explicit members" do
      outsider = create(:user, :submitter)
      membership =
        create(
          :project_membership,
          permit_project:,
          user: member,
          role: :contributor
        )
      create(
        :project_membership,
        permit_project:,
        user: outsider,
        role: :contributor
      )
      custom_team.project_memberships << membership
      permit_project.reload

      expect(permit_project.permissions_for(member).project_read?).to be true
      expect(permit_project.permissions_for(outsider).project_read?).to be false
    end

    it "grants nothing until the invitation is accepted" do
      membership =
        create(
          :project_membership,
          :pending,
          permit_project:,
          invited_email: member.email
        )
      custom_team.project_memberships << membership

      # permissions_for memoizes per instance, so each read starts from a fresh
      # project the way a real request would.
      expect(
        PermitProject.find(permit_project.id).permissions_for(member)
      ).to eq(ProjectPermissions.none)

      membership.accept!(member)

      expect(
        PermitProject
          .find(permit_project.id)
          .permissions_for(member)
          .project_read?
      ).to be true
    end

    # ProjectTeam.for_membership and ProjectMembership.project_access_sql have to
    # agree, or a user sees a project they cannot open (or the reverse).
    it "resolves the same way in Ruby and in SQL" do
      membership =
        create(
          :project_membership,
          permit_project:,
          user: member,
          role: :contributor
        )
      custom_team.project_memberships << membership
      permit_project.reload

      sql =
        ProjectMembership.project_access_sql(
          project_id_sql: "permit_projects.id"
        )
      visible_in_sql =
        PermitProject.where(sql, uid: member.id).exists?(id: permit_project.id)

      expect(permit_project.permissions_for(member).project_read?).to eq(
        visible_in_sql
      )
      expect(visible_in_sql).to be true
    end

    it "rejects a membership from another project" do
      other_membership = create(:project_membership, user: member)

      join =
        ProjectTeamMembership.new(
          project_team: custom_team,
          project_membership: other_membership
        )

      expect(join).not_to be_valid
      expect(join.errors[:project_membership]).to be_present
    end

    it "rejects explicit membership on an auto team" do
      membership =
        create(:project_membership, permit_project:, user: member, role: :lead)

      join =
        ProjectTeamMembership.new(
          project_team: team(:leads),
          project_membership: membership
        )

      expect(join).not_to be_valid
      expect(join.errors[:project_team]).to be_present
    end

    it "requires a name unique within the project, case-insensitively" do
      custom_team

      duplicate =
        permit_project.project_teams.new(name: "plumbers", kind: :custom)

      expect(duplicate).not_to be_valid
    end
  end
end
