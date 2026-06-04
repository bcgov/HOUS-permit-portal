require "rails_helper"

RSpec.describe ProjectMeetingPolicy, type: :policy do
  let(:sandbox) { nil }
  let(:jurisdiction) { create(:sub_district, project_meetings_enabled: true) }
  let(:owner) { create(:user, :submitter) }
  let(:other_user) { create(:user, :submitter) }
  let(:collaborator_user) { create(:user, :submitter) }
  let(:reviewer) { create(:user, :reviewer, jurisdiction: jurisdiction) }
  let(:permit_project) do
    create(:permit_project, owner: owner, jurisdiction: jurisdiction)
  end
  let(:meeting) { create(:project_meeting, permit_project: permit_project) }

  before { SiteConfiguration.instance.update!(project_meetings_enabled: true) }

  def policy(user, record = meeting)
    policy_for(described_class, user:, record:, sandbox:)
  end

  it "allows the project owner to create and update a draft request" do
    expect(policy(owner).create?).to be true
    expect(policy(owner).update?).to be true
    expect(policy(owner).submit?).to be true
  end

  it "blocks unrelated submitters" do
    expect(policy(other_user).show?).to be false
    expect(policy(other_user).create?).to be false
    expect(policy(other_user).update?).to be false
  end

  it "blocks submitter collaborators during the submitter phase" do
    permit_application =
      create(
        :permit_application,
        permit_project: permit_project,
        submitter: owner,
        jurisdiction: jurisdiction
      )
    collaborator =
      create(:collaborator, user: collaborator_user, collaboratorable: owner)
    create(
      :permit_collaboration,
      permit_application: permit_application,
      collaborator: collaborator,
      collaboration_type: :submission
    )

    expect(policy(collaborator_user).show?).to be false
    expect(policy(collaborator_user).update?).to be false
  end

  it "allows jurisdiction review staff to view submitted requests but not update" do
    open_meeting =
      create(:project_meeting, :open, permit_project: permit_project)

    expect(policy(reviewer, open_meeting).show?).to be true
    expect(policy(reviewer, open_meeting).update?).to be false
  end

  it "blocks jurisdiction review staff from viewing draft requests" do
    expect(policy(reviewer).show?).to be false
  end

  it "allows jurisdiction review staff to manually transition open requests" do
    open_meeting =
      create(:project_meeting, :open, permit_project: permit_project)

    expect(policy(reviewer, open_meeting).transition_status?).to be true
  end

  it "allows jurisdiction review staff to mark requests read or unread" do
    open_meeting =
      create(:project_meeting, :open, permit_project: permit_project)

    expect(policy(reviewer, open_meeting).mark_as_viewed?).to be true
    expect(policy(reviewer, open_meeting).mark_as_unviewed?).to be true
  end

  it "blocks owners from marking requests read or unread" do
    expect(policy(owner).mark_as_viewed?).to be false
    expect(policy(owner).mark_as_unviewed?).to be false
  end

  it "blocks owners from manually transitioning request status" do
    open_meeting =
      create(:project_meeting, :open, permit_project: permit_project)

    expect(policy(owner, open_meeting).transition_status?).to be false
  end

  it "allows owners to cancel open and scheduled requests" do
    open_meeting =
      create(:project_meeting, :open, permit_project: permit_project)
    scheduled_meeting =
      create(
        :project_meeting,
        :scheduled,
        permit_project: create(:permit_project, owner:, jurisdiction:)
      )

    expect(policy(owner, open_meeting).cancel?).to be true
    expect(policy(owner, scheduled_meeting).cancel?).to be true
  end

  it "blocks review staff from cancelling as a submitter action" do
    open_meeting =
      create(:project_meeting, :open, permit_project: permit_project)

    expect(policy(reviewer, open_meeting).cancel?).to be false
  end

  it "blocks manual transitions when no transition is available" do
    closed_meeting =
      create(:project_meeting, :closed, permit_project: permit_project)

    expect(policy(reviewer, closed_meeting).transition_status?).to be false
  end

  it "blocks creation when the global feature gate is off" do
    SiteConfiguration.instance.update!(project_meetings_enabled: false)

    expect(policy(owner).create?).to be false
  end

  it "blocks creation when the jurisdiction feature gate is off" do
    jurisdiction.update!(project_meetings_enabled: false)

    expect(policy(owner).create?).to be false
  end

  describe "Scope" do
    def resolved_scope_for(user)
      described_class::Scope.new(
        UserContext.new(user, sandbox),
        ProjectMeeting.all
      ).resolve
    end

    it "includes project meetings for the project owner" do
      meeting
      create(:project_meeting, permit_project: create(:permit_project))

      expect(resolved_scope_for(owner)).to contain_exactly(meeting)
    end

    it "includes submitted project meetings for jurisdiction review staff" do
      open_meeting =
        create(:project_meeting, :open, permit_project: permit_project)

      expect(resolved_scope_for(reviewer)).to include(open_meeting)
    end

    it "excludes draft project meetings for jurisdiction review staff" do
      meeting

      expect(resolved_scope_for(reviewer)).not_to include(meeting)
    end

    it "excludes meetings for submitter collaborators" do
      meeting

      expect(resolved_scope_for(collaborator_user)).to be_empty
    end
  end
end
