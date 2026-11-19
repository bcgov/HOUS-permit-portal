require "rails_helper"

RSpec.describe "Project membership and grant activity", type: :model do
  let(:owner) do
    create(:user, :submitter, first_name: "Ada", last_name: "Owner")
  end
  let(:project) { create(:permit_project, owner: owner) }

  def described_sentence(audit)
    ProjectAuditPresenter.new(audit, owner).format_description
  end

  it "does not audit the owner membership or an invite that only expires" do
    owner_membership = project.project_memberships.find_by!(user: owner)
    expect(owner_membership.audits).to be_empty

    invite =
      create(
        :project_membership,
        :pending_invitation,
        permit_project: project,
        invited_first_name: "Wanda",
        invited_last_name: "Walls"
      )

    expect {
      invite.update_columns(invitation_sent_at: 4.days.ago)
    }.not_to change { invite.audits.count }
    expect(invite).to be_expired
    expect(
      invite.audits.map { |audit| described_sentence(audit) }.join
    ).not_to include("@")
  end

  it "records an invitation on the project and a removed grant only when the grant itself is removed" do
    invite = nil
    Audited
      .audit_class
      .as_user(owner) do
        invite =
          create(
            :project_membership,
            :pending_invitation,
            permit_project: project,
            invited_first_name: "Wanda",
            invited_last_name: "Walls"
          )
      end

    create_audit = invite.audits.find_by!(action: "create")
    expect(create_audit.associated).to eq(project)
    expect(described_sentence(create_audit)).to eq(
      "Ada Owner invited Wanda Walls"
    )
    expect(create_audit.audited_changes).not_to have_key("invited_email")
    expect(create_audit.audited_changes).not_to have_key("invitation_token")

    member =
      create(
        :project_membership,
        permit_project: project,
        user:
          create(:user, :submitter, first_name: "Blake", last_name: "Member"),
        access: :limited
      )
    grant = create(:project_grant, project_membership: member)
    grant_id = grant.id

    Audited.audit_class.as_user(owner) { member.destroy! }

    expect(
      ApplicationAudit.where(
        auditable_type: "ProjectGrant",
        auditable_id: grant_id,
        action: "destroy"
      )
    ).to be_empty
    removal = member.audits.find_by!(action: "destroy")
    expect(described_sentence(removal)).to eq(
      "Ada Owner removed Blake Member from the project"
    )
  end

  it "records the previous primary contact losing the designation" do
    creator = project.project_memberships.find_by!(user: owner)
    member =
      create(
        :project_membership,
        permit_project: project,
        user:
          create(:user, :submitter, first_name: "Blake", last_name: "Member")
      )

    Audited
      .audit_class
      .as_user(owner) { member.update!(contact_designation: :primary) }

    demotion =
      creator
        .audits
        .where(action: "update")
        .find { |audit| audit.audited_changes.key?("contact_designation") }
    expect(described_sentence(demotion)).to eq(
      "Ada Owner changed Ada Owner's contact designation from primary to none"
    )
  end
end
