require "rails_helper"

RSpec.describe ProjectGrant, type: :model do
  let(:owner) { create(:user, :submitter) }
  let(:project) { create(:permit_project, owner: owner) }
  let(:application) do
    create(
      :permit_application,
      permit_project: project,
      submitter: owner,
      jurisdiction: project.jurisdiction
    )
  end
  let(:membership) do
    create(
      :project_membership,
      permit_project: project,
      user: create(:user, :submitter),
      access: :standard
    )
  end

  it "stores a block grant and an application grant on an accepted member" do
    block_grant =
      described_class.create!(
        project_membership: membership,
        permit_application: application,
        kind: :block,
        requirement_block_id: SecureRandom.uuid
      )
    application_grant =
      described_class.create!(
        project_membership: membership,
        permit_application: application,
        kind: :application
      )

    expect(block_grant).to be_block
    expect(application_grant).to be_application
    expect(application_grant.requirement_block_id).to be_nil
  end

  it "drops a block id on an application grant and refuses invite on an application" do
    grant =
      described_class.create!(
        project_membership: membership,
        permit_application: application,
        kind: :application,
        requirement_block_id: SecureRandom.uuid
      )

    expect(grant.requirement_block_id).to be_nil
    expect {
      described_class.build_for_application(
        application,
        membership_id: membership.id,
        kind: "invite",
        requirement_block_id: nil
      )
    }.to raise_error(ActiveRecord::RecordNotFound)
    expect {
      described_class.build_for_application(
        application,
        membership_id: membership.id,
        kind: "nope",
        requirement_block_id: nil
      )
    }.to raise_error(ActiveRecord::RecordNotFound)
  end

  it "rejects a second grant of the same block" do
    block_id = SecureRandom.uuid
    described_class.create!(
      project_membership: membership,
      permit_application: application,
      kind: :block,
      requirement_block_id: block_id
    )

    duplicate =
      described_class.new(
        project_membership: membership,
        permit_application: application,
        kind: :block,
        requirement_block_id: block_id
      )

    expect(duplicate).not_to be_valid
  end

  it "rejects a grant on a pending invite" do
    pending =
      create(:project_membership, :pending_invitation, permit_project: project)

    grant =
      described_class.new(
        project_membership: pending,
        permit_application: application,
        kind: :block,
        requirement_block_id: SecureRandom.uuid
      )

    expect(grant).not_to be_valid
  end

  it "stores an invite grant on a pending Expanded invitation" do
    pending =
      create(
        :project_membership,
        :pending_invitation,
        permit_project: project,
        access: :expanded
      )

    grant = described_class.create!(project_membership: pending, kind: :invite)

    expect(grant).to be_persisted
  end

  it "rejects an application from another project" do
    other = create(:permit_application)

    grant =
      described_class.new(
        project_membership: membership,
        permit_application: other,
        kind: :application
      )

    expect(grant).not_to be_valid
  end

  it "stores an invite grant only on an Expanded member, with no application" do
    expanded =
      create(
        :project_membership,
        permit_project: project,
        user: create(:user, :submitter),
        access: :expanded
      )
    invite =
      described_class.create!(project_membership: expanded, kind: :invite)

    expect(invite.permit_application).to be_nil
    expect(invite.requirement_block_id).to be_nil

    on_standard =
      described_class.new(project_membership: membership, kind: :invite)

    expect(on_standard).not_to be_valid
  end

  it "rejects a block grant or an application grant on a member who is not Standard" do
    expanded =
      create(
        :project_membership,
        permit_project: project,
        user: create(:user, :submitter),
        access: :expanded
      )

    expect(
      described_class.new(
        project_membership: expanded,
        permit_application: application,
        kind: :block,
        requirement_block_id: SecureRandom.uuid
      )
    ).not_to be_valid
    expect(
      described_class.new(
        project_membership: expanded,
        permit_application: application,
        kind: :application
      )
    ).not_to be_valid

    owner_membership = project.project_memberships.find_by!(user: owner)
    expect(
      described_class.new(
        project_membership: owner_membership,
        permit_application: application,
        kind: :application
      )
    ).not_to be_valid
    expect(
      described_class.new(project_membership: owner_membership, kind: :invite)
    ).not_to be_valid
  end

  it "keeps grants when access changes and authorizes only a matching level" do
    user = membership.user
    block_grant =
      create(
        :project_grant,
        project_membership: membership,
        permit_application: application,
        requirement_block_id: SecureRandom.uuid
      )
    application_grant =
      create(
        :project_grant,
        :application,
        project_membership: membership,
        permit_application: application
      )

    membership.update!(access: :expanded)
    expect(ProjectGrant.exists?(block_grant.id)).to be true
    expect(ProjectGrant.exists?(application_grant.id)).to be true
    expect(application.block_granted_to?(user)).to be false
    expect(application.application_granted_to?(user)).to be false

    invite = create(:project_grant, :invite, project_membership: membership)
    access = ProjectAccess.new(user, project.sandbox, project)
    expect(access.invite_people?).to be true

    membership.update!(access: :standard)
    access = ProjectAccess.new(user, project.sandbox, project)
    expect(ProjectGrant.exists?(invite.id)).to be true
    expect(access.invite_people?).to be false
    expect(application.block_granted_to?(user)).to be true
    expect(application.application_granted_to?(user)).to be true

    membership.update!(access: :full)
    expect(ProjectGrant.where(project_membership: membership).count).to eq(3)
    expect(application.application_granted_to?(user)).to be false
    expect(application.block_granted_to?(user)).to be false
  end
end
