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

  it "denies Expanded and Standard from inviting or choosing access" do
    expanded = create(:user, :submitter)
    standard = create(:user, :submitter)
    create(
      :project_membership,
      permit_project: project,
      user: expanded,
      access: :expanded
    )
    create(
      :project_membership,
      permit_project: project,
      user: standard,
      access: :standard
    )
    invite = project.project_memberships.new(access: :full)

    expect(policy(invite, acting_user: expanded).create?).to be false
    expect(policy(invite, acting_user: standard).create?).to be false
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

  it "denies Expanded and Standard from resending or canceling an invitation" do
    pending =
      create(:project_membership, :pending_invitation, permit_project: project)
    expired =
      create(
        :project_membership,
        :pending_invitation,
        permit_project: project,
        invitation_sent_at: 4.days.ago
      )
    expanded = create(:user, :submitter)
    standard = create(:user, :submitter)
    create(
      :project_membership,
      permit_project: project,
      user: expanded,
      access: :expanded
    )
    create(
      :project_membership,
      permit_project: project,
      user: standard,
      access: :standard
    )

    [expanded, standard].each do |person|
      expect(policy(pending, acting_user: person).reinvite?).to be false
      expect(policy(pending, acting_user: person).destroy?).to be false
      expect(policy(expired, acting_user: person).reinvite?).to be false
      expect(policy(expired, acting_user: person).destroy?).to be false
    end
  end

  it "lets Expanded and Standard leave by removing their own membership" do
    expanded_user = create(:user, :submitter)
    expanded =
      create(
        :project_membership,
        permit_project: project,
        user: expanded_user,
        access: :expanded
      )
    standard_user = create(:user, :submitter)
    standard =
      create(
        :project_membership,
        permit_project: project,
        user: standard_user,
        access: :standard
      )

    expect(policy(expanded, acting_user: expanded_user).destroy?).to be true
    expect(policy(standard, acting_user: standard_user).destroy?).to be true
    expect(policy(membership, acting_user: expanded_user).destroy?).to be false
    expect(policy(membership, acting_user: standard_user).destroy?).to be false
  end

  it "lets Expanded edit anyone's role tags, not their access" do
    expanded_user = create(:user, :submitter)
    expanded =
      create(
        :project_membership,
        permit_project: project,
        user: expanded_user,
        access: :expanded
      )
    full_member =
      create(
        :project_membership,
        permit_project: project,
        user: create(:user, :submitter),
        access: :full
      )

    expect(
      policy(expanded, acting_user: expanded_user).update_role_tags?
    ).to be true
    expect(
      policy(membership, acting_user: expanded_user).update_role_tags?
    ).to be true
    expect(
      policy(full_member, acting_user: expanded_user).update_role_tags?
    ).to be true
    expect(
      policy(expanded, acting_user: expanded_user).update_standing?
    ).to be false
  end

  it "denies Standard from changing anyone's role" do
    standard_user = create(:user, :submitter)
    standard =
      create(
        :project_membership,
        permit_project: project,
        user: standard_user,
        access: :standard
      )

    expect(
      policy(standard, acting_user: standard_user).update_role_tags?
    ).to be false
    expect(
      policy(membership, acting_user: standard_user).update_role_tags?
    ).to be false
  end

  it "denies Expanded and Standard from changing access or contact designation" do
    expanded = create(:user, :submitter)
    standard = create(:user, :submitter)
    create(
      :project_membership,
      permit_project: project,
      user: expanded,
      access: :expanded
    )
    create(
      :project_membership,
      permit_project: project,
      user: standard,
      access: :standard
    )

    expect(
      policy(membership, acting_user: expanded).update_standing?
    ).to be false
    expect(
      policy(membership, acting_user: standard).update_standing?
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

  context "for a Full member of a different project" do
    let(:outsider) { create(:user, :submitter) }
    let(:other_application) do
      create(
        :permit_application,
        submitter: outsider,
        jurisdiction: project.jurisdiction,
        sandbox: project.sandbox
      )
    end
    let(:other_project) { other_application.permit_project }
    let(:other_membership) do
      create(
        :project_membership,
        permit_project: other_project,
        user: create(:user, :submitter)
      )
    end

    def expect_outsider_is_full
      expect(
        other_project.project_memberships.find_by!(user: outsider)
      ).to be_full
    end

    it "create? denies a Full member of a different project" do
      expect_outsider_is_full

      expect(policy(other_membership, acting_user: outsider).create?).to be true
      expect(policy(membership, acting_user: outsider).create?).to be false
    end

    it "reinvite? denies a Full member of a different project" do
      expect_outsider_is_full

      expect(
        policy(other_membership, acting_user: outsider).reinvite?
      ).to be true
      expect(policy(membership, acting_user: outsider).reinvite?).to be false
    end

    it "update_standing? denies a Full member of a different project" do
      expect_outsider_is_full

      expect(
        policy(other_membership, acting_user: outsider).update_standing?
      ).to be true
      expect(
        policy(membership, acting_user: outsider).update_standing?
      ).to be false
    end

    it "update_role_tags? denies a Full member of a different project" do
      expect_outsider_is_full

      expect(
        policy(other_membership, acting_user: outsider).update_role_tags?
      ).to be true
      expect(
        policy(membership, acting_user: outsider).update_role_tags?
      ).to be false
    end

    it "destroy? denies a Full member of a different project" do
      expect_outsider_is_full

      expect(
        policy(other_membership, acting_user: outsider).destroy?
      ).to be true
      expect(policy(membership, acting_user: outsider).destroy?).to be false
    end
  end
end
