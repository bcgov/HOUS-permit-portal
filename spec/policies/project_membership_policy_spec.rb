require "rails_helper"

RSpec.describe ProjectMembershipPolicy, type: :policy do
  let(:sandbox) { nil }
  let(:owner) { create(:user, :submitter) }
  let(:project) { create(:permit_project, owner: owner) }
  let(:membership) do
    create(
      :project_membership,
      permit_project: project,
      user: create(:user, :submitter)
    )
  end

  def policy(record, acting_user: owner)
    policy_for(
      described_class,
      user: acting_user,
      record: record,
      sandbox: sandbox
    )
  end

  it "lets the project owner create, reinvite, update, and remove another member" do
    expect(policy(membership).create?).to be true
    expect(policy(membership).reinvite?).to be true
    expect(policy(membership).update?).to be true
    expect(policy(membership).destroy?).to be true
  end

  it "forbids a member who does not own the project" do
    member = create(:user, :submitter)

    expect(policy(membership, acting_user: member).create?).to be false
    expect(policy(membership, acting_user: member).reinvite?).to be false
    expect(policy(membership, acting_user: member).update?).to be false
    expect(policy(membership, acting_user: member).destroy?).to be false
  end

  it "lets a submitter view, accept, or decline a pending invitation" do
    invitee = create(:user, :submitter)
    pending_invite =
      create(:project_membership, :pending_invitation, permit_project: project)

    expect(
      policy(pending_invite, acting_user: invitee).show_invitation?
    ).to be true
    expect(
      policy(pending_invite, acting_user: invitee).accept_invitation?
    ).to be true
    expect(
      policy(pending_invite, acting_user: invitee).decline_invitation?
    ).to be true
  end

  it "forbids a reviewer from viewing, accepting, or declining a pending invitation" do
    reviewer = create(:user, :reviewer)
    pending_invite =
      create(:project_membership, :pending_invitation, permit_project: project)

    expect(
      policy(pending_invite, acting_user: reviewer).show_invitation?
    ).to be false
    expect(
      policy(pending_invite, acting_user: reviewer).accept_invitation?
    ).to be false
    expect(
      policy(pending_invite, acting_user: reviewer).decline_invitation?
    ).to be false
  end
end
