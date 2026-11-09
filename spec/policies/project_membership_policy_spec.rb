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

  it "lets a Full member create, reinvite, change standing, and remove another member" do
    expect(policy(membership).create?).to be true
    expect(policy(membership).reinvite?).to be true
    expect(policy(membership).update_standing?).to be true
    expect(policy(membership).update_role_tags?).to be true
    expect(policy(membership).destroy?).to be true
  end

  it "lets a Full member who is not the creator do the same" do
    member = create(:user, :submitter)
    create(
      :project_membership,
      permit_project: project,
      user: member,
      access: :full
    )

    expect(policy(membership, acting_user: member).create?).to be true
    expect(policy(membership, acting_user: member).update_standing?).to be true
    expect(policy(membership, acting_user: member).destroy?).to be true
  end

  it "forbids a user with no membership" do
    member = create(:user, :submitter)

    expect(policy(membership, acting_user: member).create?).to be false
    expect(policy(membership, acting_user: member).reinvite?).to be false
    expect(policy(membership, acting_user: member).update_standing?).to be false
    expect(
      policy(membership, acting_user: member).update_role_tags?
    ).to be false
    expect(policy(membership, acting_user: member).destroy?).to be false
  end

  it "cancels a pending invite with invite access and removes an active member with standing access" do
    pending =
      create(:project_membership, :pending_invitation, permit_project: project)
    expanded = create(:user, :submitter)
    create(
      :project_membership,
      permit_project: project,
      user: expanded,
      access: :expanded
    )

    expect(policy(pending).destroy?).to be true
    expect(policy(membership).destroy?).to be true
    expect(policy(pending, acting_user: expanded).destroy?).to be false
    expect(policy(membership, acting_user: expanded).destroy?).to be false
  end

  it "lets Expanded edit role tags on themself and a Standard member, not access" do
    expanded_user = create(:user, :submitter)
    expanded =
      create(
        :project_membership,
        permit_project: project,
        user: expanded_user,
        access: :expanded
      )

    expect(
      policy(expanded, acting_user: expanded_user).update_role_tags?
    ).to be true
    expect(
      policy(membership, acting_user: expanded_user).update_role_tags?
    ).to be true
    expect(
      policy(expanded, acting_user: expanded_user).update_standing?
    ).to be false

    full_member =
      create(
        :project_membership,
        permit_project: project,
        user: create(:user, :submitter),
        access: :full
      )
    expect(
      policy(full_member, acting_user: expanded_user).update_role_tags?
    ).to be false
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
