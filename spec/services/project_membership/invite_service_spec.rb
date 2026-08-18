require "rails_helper"

RSpec.describe ProjectMembership::InviteService, type: :service do
  let(:owner) { create(:user, :submitter) }
  let(:inviter) { owner }
  let!(:permit_project) { create(:permit_project, owner: owner) }
  let(:service) do
    described_class.new(permit_project: permit_project, inviter: inviter)
  end

  def invite!(email, role: :contributor)
    service.invite!(role: role, user_params: { email: email })
  end

  it "creates a pending membership without attaching an existing user" do
    existing = create(:user, :submitter, email: "already@example.com")

    expect { invite!("already@example.com") }.to have_enqueued_mail(
      PermitHubMailer,
      :notify_project_membership_invitation
    ).and not_change(User, :count)

    membership = permit_project.project_memberships.kept.last
    expect(membership.user).to be_nil
    expect(membership.pending?).to be true
    expect(membership.invited_email).to eq("already@example.com")
    expect(membership.invitation_token_digest).to be_present

    payload = ProjectMembershipBlueprint.render_as_hash(membership, view: :base)
    expect(payload[:user]).to be_nil
    expect(payload[:invited_email]).to eq("already@example.com")
    expect(payload[:is_invitation_pending]).to eq(true)

    expect(permit_project.permissions_for(existing).project_read?).to be false
    expect(permit_project.readable_user_ids).not_to include(existing.id)
    expect(permit_project.membership_for(existing)).to be_nil
  end

  it "does not grant listing access until the invite is accepted" do
    invitee = create(:user, :submitter, email: "invitee@example.com")
    membership = invite!("invitee@example.com")

    expect(
      PermitProjectPolicy.new(
        UserContext.new(invitee, nil),
        permit_project
      ).show?
    ).to be false

    membership.accept!(invitee)

    expect(membership.reload.user).to eq(invitee)
    expect(membership.accepted?).to be true
    expect(permit_project.reload.membership_for(invitee)).to eq(membership)
    expect(
      PermitProjectPolicy.new(
        UserContext.new(invitee, nil),
        permit_project
      ).show?
    ).to be true
  end

  it "binds the accepting user rather than the first user with that email" do
    create(:user, :submitter, email: "shared@example.com")
    invitee = create(:user, :submitter, email: "shared@example.com")
    membership = invite!("shared@example.com")

    expect(membership.user_id).to be_nil

    membership.accept!(invitee)
    expect(membership.reload.user).to eq(invitee)
  end

  it "binds whoever accepts, even when their Hub email differs from the invite" do
    invitee = create(:user, :submitter, email: "other-login@example.com")
    membership = invite!("target@example.com")

    membership.accept!(invitee)
    expect(membership.reload.user).to eq(invitee)
  end

  it "resends rather than duplicating a pending invite to the same email" do
    first = invite!("repeat@example.com")
    second = invite!("repeat@example.com")

    expect(second.id).to eq(first.id)
    expect(permit_project.project_memberships.kept.count).to eq(1)
  end

  it "does not look up the project owner by email to auto-add them" do
    expect { invite!(owner.email) }.to raise_error(
      described_class::Error,
      I18n.t("services.project_membership.invite.owner_already_member")
    )
    expect(permit_project.project_memberships).to be_empty
  end

  it "does not create a user for an unknown email" do
    expect { invite!("brand-new-invitee@example.com") }.not_to change(
      User,
      :count
    )
    expect(permit_project.project_memberships.kept.last.user_id).to be_nil
  end
end
