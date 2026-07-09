require "rails_helper"

RSpec.describe ProjectAuditFormatters::PermitProjectCollaborationFormatter do
  let(:user) { instance_double(User, name: "Alice", blank?: false) }
  let(:reviewer_user) { instance_double(User, name: "Bob Reviewer") }
  let(:collaborator) { instance_double(Collaborator, user: reviewer_user) }
  let(:permit_project) { instance_double(PermitProject, jurisdiction: nil) }
  let(:collaboration) do
    instance_double(
      PermitProjectCollaboration,
      collaborator: collaborator,
      permit_project: permit_project
    )
  end

  subject(:formatter) { described_class.new(audit, nil) }

  describe "#description" do
    context 'when action is "create"' do
      let(:audit) do
        build_audit_double(
          user: user,
          auditable: collaboration,
          auditable_type: "PermitProjectCollaboration",
          action: "create"
        )
      end

      it "returns assignment message" do
        expect(formatter.description).to eq(
          "Alice assigned Bob Reviewer as project reviewer"
        )
      end
    end

    context 'when action is "update" with discard' do
      let(:audit) do
        build_audit_double(
          user: user,
          auditable: collaboration,
          auditable_type: "PermitProjectCollaboration",
          action: "update",
          audited_changes: {
            "discarded_at" => [nil, Time.current]
          }
        )
      end

      it "returns removal message" do
        expect(formatter.description).to eq(
          "Alice removed Bob Reviewer as project reviewer"
        )
      end
    end
  end
end
