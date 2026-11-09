require "rails_helper"

RSpec.describe ProjectMembership, type: :model do
  it "rejects a second membership for the same user and project" do
    membership = create(:project_membership)
    duplicate =
      build(
        :project_membership,
        user: membership.user,
        permit_project: membership.permit_project
      )

    expect(duplicate).not_to be_valid
    expect(duplicate.errors[:user_id]).to be_present
  end

  it "gives the creator a full primary membership" do
    project = create(:permit_project)
    membership = project.project_memberships.find_by!(user: project.creator)

    expect(membership.access).to eq("full")
    expect(membership.contact_designation).to eq("primary")
    expect(project.creator_id).to eq(project.owner_id)
  end

  it "allows several alternates and only one primary" do
    project = create(:permit_project)
    create(
      :project_membership,
      permit_project: project,
      contact_designation: :alternate
    )
    create(
      :project_membership,
      permit_project: project,
      contact_designation: :alternate
    )

    extra_primary =
      build(
        :project_membership,
        permit_project: project,
        contact_designation: :primary
      )
    expect(extra_primary).not_to be_valid
  end

  it "refuses to clear the primary contact" do
    project = create(:permit_project)
    membership = project.project_memberships.find_by!(user: project.creator)
    membership.contact_designation = :none

    expect(membership).not_to be_valid
    expect(membership.errors[:contact_designation]).to be_present
  end

  it "moves primary contact onto another membership" do
    project = create(:permit_project)
    creator_membership =
      project.project_memberships.find_by!(user: project.creator)
    membership = create(:project_membership, permit_project: project)

    membership.update!(contact_designation: :primary)

    expect(membership.reload.contact_designation).to eq("primary")
    expect(creator_membership.reload.contact_designation).to eq("none")
  end

  it "keeps the current primary when a transfer fails to save" do
    project = create(:permit_project)
    creator_membership =
      project.project_memberships.find_by!(user: project.creator)
    membership = create(:project_membership, permit_project: project)

    expect(
      membership.update(contact_designation: :primary, access: "nope")
    ).to be_falsey
    expect(creator_membership.reload.contact_designation).to eq("primary")
    expect(membership.reload.contact_designation).to eq("none")
  end

  it "stores whatever role tags it is given" do
    membership = create(:project_membership)
    membership.role_list = %w[Architect Builder]
    membership.save!

    expect(membership.reload.role_list).to contain_exactly(
      "Architect",
      "Builder"
    )
  end

  it "tracks pending and expired invitation status after 3 days" do
    pending_invite = create(:project_membership, :pending_invitation)
    expect(pending_invite).to be_pending
    expect(pending_invite.status).to eq("pending")

    pending_invite.update!(invitation_sent_at: 4.days.ago)
    expect(pending_invite).to be_expired
    expect(pending_invite.status).to eq("expired")
  end

  it "keeps the current primary contact until a pending primary invitation is accepted" do
    project = create(:permit_project)
    creator_membership =
      project.project_memberships.find_by!(user: project.creator)
    invitee = create(:user, :submitter)

    pending_primary =
      create(
        :project_membership,
        :pending_invitation,
        permit_project: project,
        contact_designation: :primary
      )

    expect(creator_membership.reload.contact_designation).to eq("primary")
    expect(pending_primary.reload.contact_designation).to eq("primary")

    pending_primary.update!(
      user: invitee,
      invitation_accepted_at: Time.current,
      invitation_token: nil
    )

    expect(pending_primary.reload.contact_designation).to eq("primary")
    expect(creator_membership.reload.contact_designation).to eq("none")
  end

  it "refuses to demote or remove the last full member" do
    project = create(:permit_project)
    membership = project.project_memberships.find_by!(user: project.creator)

    expect(membership.update(access: :standard)).to be false
    expect(membership.errors[:access]).to be_present
    expect(membership.destroy).to be false
    expect(ProjectMembership.exists?(membership.id)).to be true
  end

  it "refuses to remove the primary contact while another full member remains" do
    project = create(:permit_project)
    create(:project_membership, permit_project: project, access: :full)
    membership = project.project_memberships.find_by!(user: project.creator)

    expect(membership.destroy).to be false
    expect(membership.errors[:base]).to be_present
    expect(ProjectMembership.exists?(membership.id)).to be true
  end

  it "removes a pending invite" do
    project = create(:permit_project)
    pending =
      create(:project_membership, :pending_invitation, permit_project: project)

    expect(pending.destroy).to be_truthy
    expect(ProjectMembership.exists?(pending.id)).to be false
  end
end
