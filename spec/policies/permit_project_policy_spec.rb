require "rails_helper"

RSpec.describe PermitProjectPolicy, type: :policy do
  let(:sandbox) { nil }
  let(:owner) { create(:user, :submitter) }
  let(:member) { create(:user, :submitter) }
  let!(:permit_project) { create(:permit_project, owner: owner) }

  def policy(user, record = permit_project)
    policy_for(described_class, user:, record:, sandbox:)
  end

  def team(kind)
    permit_project.project_teams.find_by(kind: kind)
  end

  describe "owner access" do
    it "permits index/show/update/destroy for owner" do
      p = policy(owner)
      expect(p.index?).to be true
      expect(p.show?).to be true
      expect(p.update?).to be true
      expect(p.destroy?).to be true
      expect(p.pin?).to be true
      expect(p.unpin?).to be true
      expect(p.search_permit_applications?).to be true
      expect(p.search_activities?).to be true
      expect(p.create_permit_applications?).to be true
      expect(p.submission_collaborator_options?).to be true
      expect(p.download_notes_csv?).to be true
    end
  end

  describe "lead access" do
    before do
      create(:project_membership, :lead, permit_project:, user: member)
      permit_project.reload
    end

    it "permits show and update but not destroy" do
      p = policy(member)
      expect(p.show?).to be true
      expect(p.update?).to be true
      expect(p.create_permit_applications?).to be true

      expect(p.destroy?).to be false
      expect(p.submission_collaborator_options?).to be false
    end
  end

  describe "contributor access" do
    before do
      create(:project_membership, permit_project:, user: member)
      permit_project.reload
    end

    it "lists the project for a contributor even when teams grant no project access" do
      p = policy(member)
      expect(p.index?).to be true
      expect(p.show?).to be true
      expect(p.pin?).to be true
      expect(p.search_permit_applications?).to be false
      expect(p.search_activities?).to be false
      expect(p.update?).to be false
    end

    it "lets a contributor search applications and activity once a team grants full read" do
      team(:all_members).update!(project_access: :read)
      permit_project.reload

      p = policy(member)
      expect(p.show?).to be true
      expect(p.search_permit_applications?).to be true
      expect(p.search_activities?).to be true
      expect(p.update?).to be false
    end
  end

  describe "non-member access" do
    it "denies index/show" do
      p = policy(create(:user, :submitter))
      expect(p.index?).to be false
      expect(p.show?).to be false
    end

    it "does not list the project for a pending invite to that user's email" do
      create(
        :project_membership,
        :pending,
        permit_project:,
        invited_email: member.email
      )

      expect(policy(member).show?).to be false
      expect(policy(member).index?).to be false
    end
  end

  describe "#create? and #jurisdiction_options?" do
    it "permits create and jurisdiction_options for anyone" do
      p = policy(create(:user, :submitter))
      expect(p.create?).to be true
      expect(p.jurisdiction_options?).to be true
    end
  end

  describe "Scope" do
    let!(:other_project) { create(:permit_project) }

    it "resolves projects the user owns" do
      expect(resolved_ids(owner)).to include(permit_project.id)
      expect(resolved_ids(owner)).not_to include(other_project.id)
    end

    it "includes projects the user is a member of even without full read" do
      create(:project_membership, permit_project:, user: member)

      expect(resolved_ids(member)).to include(permit_project.id)
    end

    it "does not include projects with only a pending invite" do
      create(
        :project_membership,
        :pending,
        permit_project:,
        invited_email: member.email
      )

      expect(resolved_ids(member)).not_to include(permit_project.id)
    end

    it "includes projects where a team grants full read" do
      create(:project_membership, :lead, permit_project:, user: member)

      expect(resolved_ids(member)).to include(permit_project.id)
    end

    # COLLAB TODO(phase 5): remove alongside the legacy submission collaborations.
    it "includes projects reached through a legacy submission collaboration" do
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

      expect(resolved_ids(member)).to include(permit_project.id)
    end

    def resolved_ids(user)
      described_class::Scope
        .new(UserContext.new(user, sandbox), PermitProject.all)
        .resolve
        .pluck(:id)
    end
  end
end
