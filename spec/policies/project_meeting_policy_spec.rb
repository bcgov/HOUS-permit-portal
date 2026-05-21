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

  it "allows jurisdiction review staff to view but not update" do
    expect(policy(reviewer).show?).to be true
    expect(policy(reviewer).update?).to be false
  end

  it "allows jurisdiction review staff to manually transition open requests" do
    open_meeting =
      create(:project_meeting, :open, permit_project: permit_project)

    expect(policy(reviewer, open_meeting).transition_status?).to be true
  end

  it "blocks owners from manually transitioning request status" do
    open_meeting =
      create(:project_meeting, :open, permit_project: permit_project)

    expect(policy(owner, open_meeting).transition_status?).to be false
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
end
