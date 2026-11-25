require "rails_helper"

RSpec.describe ProjectAuditFormatters::ProjectGrantFormatter do
  let(:actor) { instance_double(User, name: "Ada Owner", blank?: false) }
  let(:project) { instance_double(PermitProject, jurisdiction: nil) }

  def grant_audit(action:, kind:, extra: {})
    build_audit_double(
      user: actor,
      action: action,
      auditable_type: "ProjectGrant",
      associated_type: "PermitProject",
      associated: project,
      audited_changes: {
        "kind" => ProjectGrant.kinds[kind],
        "person_name" => "Blake Member",
        "application_name" => "House",
        "permit_application_id" => "application-id"
      }.merge(extra)
    )
  end

  it "describes an application grant being given and removed" do
    given = grant_audit(action: "create", kind: "application")
    removed = grant_audit(action: "destroy", kind: "application")

    expect(described_class.new(given, nil).description).to eq(
      "Ada Owner gave Blake Member access to the whole application House"
    )
    expect(described_class.new(removed, nil).description).to eq(
      "Ada Owner removed Blake Member's access to the whole application House"
    )
  end

  it "describes a block grant with the block name" do
    audit =
      grant_audit(
        action: "create",
        kind: "block",
        extra: {
          "block_name" => "Site info",
          "requirement_block_id" => "block-id"
        }
      )

    expect(described_class.new(audit, nil).description).to eq(
      "Ada Owner gave Blake Member access to Site info on House"
    )
    expect(described_class.new(audit, nil).requirement_block_id).to eq(
      "block-id"
    )
  end

  it "describes an invite grant without an application" do
    audit =
      grant_audit(
        action: "destroy",
        kind: "invite",
        extra: {
          "application_name" => nil,
          "permit_application_id" => nil
        }
      )

    expect(described_class.new(audit, nil).description).to eq(
      "Ada Owner removed Blake Member's permission to invite people"
    )
    expect(described_class.new(audit, nil).permit_application_id).to be_nil
  end
end
