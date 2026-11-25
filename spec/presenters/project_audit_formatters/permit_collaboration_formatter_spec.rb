require "rails_helper"

RSpec.describe ProjectAuditFormatters::PermitCollaborationFormatter do
  let(:user) { instance_double(User, name: "Alice", blank?: false) }
  let(:viewer) { nil }
  let(:permit_application) do
    instance_double(
      PermitApplication,
      jurisdiction: instance_double(Jurisdiction),
      id: "pa-1"
    )
  end

  subject(:formatter) { described_class.new(audit, viewer) }

  def collaboration(**attrs)
    instance_double(
      PermitCollaboration,
      blank?: false,
      delegatee?: false,
      assignee?: false,
      collaborator_name: "Dave",
      assigned_requirement_block_name: "",
      permit_application: permit_application,
      permit_application_id: "pa-1",
      assigned_requirement_block_id: nil,
      **attrs
    )
  end

  describe "#description" do
    context "when auditable is nil" do
      let(:audit) do
        build_audit_double(
          user: user,
          auditable: nil,
          auditable_type: "PermitCollaboration",
          action: "create"
        )
      end

      it "returns collaborator fallback message" do
        expect(formatter.description).to eq(
          "Alice made a change to the collaborators"
        )
      end
    end

    context 'when action is "create"' do
      context "delegatee" do
        let(:audit) do
          build_audit_double(
            user: user,
            auditable:
              collaboration(delegatee?: true, collaborator_name: "Dave"),
            auditable_type: "PermitCollaboration",
            action: "create"
          )
        end

        it "returns reviewer assignment message" do
          expect(formatter.description).to eq("Alice assigned Dave as reviewer")
        end
      end

      context "assignee" do
        let(:audit) do
          build_audit_double(
            user: user,
            auditable:
              collaboration(assignee?: true, collaborator_name: "Carol"),
            auditable_type: "PermitCollaboration",
            action: "create"
          )
        end

        it "returns application assignment message" do
          expect(formatter.description).to eq("Carol assigned to application")
        end
      end

      context "neither delegatee nor assignee" do
        let(:audit) do
          build_audit_double(
            user: user,
            auditable: collaboration(collaborator_name: "Eve"),
            auditable_type: "PermitCollaboration",
            action: "create"
          )
        end

        it "returns the fallback" do
          expect(formatter.description).to eq(
            "Alice made a change to the collaborators"
          )
        end
      end
    end

    context 'when action is "update" (discard)' do
      let(:discarded_changes) { { "discarded_at" => [nil, "2026-01-01"] } }

      context "delegatee" do
        let(:audit) do
          build_audit_double(
            user: user,
            auditable:
              collaboration(delegatee?: true, collaborator_name: "Dave"),
            auditable_type: "PermitCollaboration",
            action: "update",
            audited_changes: discarded_changes
          )
        end

        it "returns reviewer removal message" do
          expect(formatter.description).to eq("Alice removed Dave as reviewer")
        end
      end

      context "assignee" do
        let(:audit) do
          build_audit_double(
            user: user,
            auditable:
              collaboration(assignee?: true, collaborator_name: "Carol"),
            auditable_type: "PermitCollaboration",
            action: "update",
            audited_changes: discarded_changes
          )
        end

        it "returns application unassignment message" do
          expect(formatter.description).to eq(
            "Carol unassigned from application"
          )
        end
      end
    end

    context 'when action is "update" without discard' do
      let(:audit) do
        build_audit_double(
          user: user,
          auditable: collaboration(delegatee?: true),
          auditable_type: "PermitCollaboration",
          action: "update",
          audited_changes: {
            "some_field" => %w[old new]
          }
        )
      end

      it "returns the fallback" do
        expect(formatter.description).to eq(
          "Alice made a change to the collaborators"
        )
      end
    end

    context "with an unrecognized action" do
      let(:audit) do
        build_audit_double(
          user: user,
          auditable: collaboration(delegatee?: true),
          auditable_type: "PermitCollaboration",
          action: "destroy"
        )
      end

      it "returns the fallback" do
        expect(formatter.description).to eq(
          "Alice made a change to the collaborators"
        )
      end
    end
  end

  describe "#permit_application" do
    let(:collab) { collaboration }
    let(:audit) do
      build_audit_double(
        user: user,
        auditable: collab,
        auditable_type: "PermitCollaboration",
        action: "create"
      )
    end

    it "returns the collaboration's permit application" do
      expect(formatter.permit_application).to eq(permit_application)
    end
  end

  describe "#permit_application_id" do
    let(:collab) { collaboration }
    let(:audit) do
      build_audit_double(
        user: user,
        auditable: collab,
        auditable_type: "PermitCollaboration",
        action: "create"
      )
    end

    it "returns the permit_application_id from the collaboration" do
      expect(formatter.permit_application_id).to eq("pa-1")
    end
  end

  describe "#requirement_block_id" do
    let(:collab) { collaboration(assigned_requirement_block_id: "block-99") }
    let(:audit) do
      build_audit_double(
        user: user,
        auditable: collab,
        auditable_type: "PermitCollaboration",
        action: "create"
      )
    end

    it "returns the assigned_requirement_block_id" do
      expect(formatter.requirement_block_id).to eq("block-99")
    end
  end
end
