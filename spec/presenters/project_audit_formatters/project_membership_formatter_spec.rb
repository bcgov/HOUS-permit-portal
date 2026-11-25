require "rails_helper"

RSpec.describe ProjectAuditFormatters::ProjectMembershipFormatter do
  let(:actor) do
    instance_double(User, id: "actor-id", name: "Ada Owner", blank?: false)
  end
  let(:project) { instance_double(PermitProject, jurisdiction: nil) }

  def membership_audit(action:, changes:, comment: nil, auditable: nil)
    build_audit_double(
      user: actor,
      action: action,
      comment: comment,
      auditable: auditable,
      auditable_type: "ProjectMembership",
      associated_type: "PermitProject",
      associated: project,
      audited_changes: changes
    )
  end

  it "describes an invitation by name and leaves out the email" do
    audit =
      membership_audit(
        action: "create",
        changes: {
          "user_id" => nil,
          "invited_first_name" => "Wanda",
          "invited_last_name" => "Walls",
          "invited_email" => "wanda@example.com",
          "person_name" => "Wanda Walls"
        }
      )

    expect(described_class.new(audit, nil).description).to eq(
      "Ada Owner invited Wanda Walls"
    )
    expect(described_class.new(audit, nil).description).not_to include("@")
  end

  it "describes an accepted invitation" do
    audit =
      membership_audit(
        action: "update",
        changes: {
          "user_id" => [nil, "member-id"],
          "person_name" => "Wanda Walls"
        }
      )

    expect(description_for(audit)).to eq("Wanda Walls accepted the invitation")
  end

  it "describes a re-sent invitation" do
    audit =
      membership_audit(
        action: "update",
        auditable:
          instance_double(
            ProjectMembership,
            user_id: nil,
            display_name: "Wanda Walls"
          ),
        changes: {
          "invitation_sent_at" => [1.hour.ago, Time.current],
          "person_name" => "Wanda Walls"
        }
      )

    expect(description_for(audit)).to eq(
      "Ada Owner re-sent an invitation to Wanda Walls"
    )
  end

  it "describes a declined invitation" do
    audit =
      membership_audit(
        action: "destroy",
        comment: ProjectMembership::INVITE_DECLINED_AUDIT,
        changes: {
          "user_id" => nil,
          "person_name" => "Wanda Walls"
        }
      )

    expect(description_for(audit)).to eq("Wanda Walls declined the invitation")
  end

  it "describes a cancelled invitation" do
    audit =
      membership_audit(
        action: "destroy",
        changes: {
          "user_id" => nil,
          "person_name" => "Wanda Walls",
          "invitation_token" => "secret-token"
        }
      )

    expect(description_for(audit)).to eq(
      "Ada Owner cancelled the invitation to Wanda Walls"
    )
    expect(description_for(audit)).not_to include("secret-token")
  end

  it "names the previous and new access and contact designation" do
    audit =
      membership_audit(
        action: "update",
        auditable: instance_double(ProjectMembership, user_id: "member-id"),
        changes: {
          "access" => [
            ProjectMembership.accesses["limited"],
            ProjectMembership.accesses["expanded"]
          ],
          "contact_designation" => [
            ProjectMembership.contact_designations["none"],
            ProjectMembership.contact_designations["alternate"]
          ],
          "person_name" => "Blake Member"
        }
      )

    expect(description_for(audit)).to eq(
      "Ada Owner changed Blake Member's access from Limited to Expanded. Ada Owner changed Blake Member's contact designation from none to alternate"
    )
  end

  it "names the previous and new project roles" do
    audit =
      membership_audit(
        action: "update",
        auditable: instance_double(ProjectMembership, user_id: "member-id"),
        changes: {
          "role_tags" => [["Architect"], ["Builder"]],
          "person_name" => "Blake Member"
        }
      )

    expect(description_for(audit)).to eq(
      "Ada Owner changed Blake Member's project roles from Architect to Builder"
    )
  end

  it "describes a member removed by someone else" do
    audit =
      membership_audit(
        action: "destroy",
        changes: {
          "user_id" => "member-id",
          "person_name" => "Blake Member"
        }
      )

    expect(description_for(audit)).to eq(
      "Ada Owner removed Blake Member from the project"
    )
  end

  it "describes a member leaving" do
    leaver =
      instance_double(
        User,
        id: "member-id",
        name: "Blake Member",
        blank?: false
      )
    audit =
      build_audit_double(
        user: leaver,
        action: "destroy",
        auditable_type: "ProjectMembership",
        associated_type: "PermitProject",
        associated: project,
        audited_changes: {
          "user_id" => "member-id",
          "person_name" => "Blake Member"
        }
      )

    expect(described_class.new(audit, nil).description).to eq(
      "Blake Member left the project"
    )
  end

  def description_for(audit)
    described_class.new(audit, nil).description
  end
end
