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
      context "submission delegatee" do
        let(:collab) do
          instance_double(
            PermitCollaboration,
            blank?: false,
            submission?: true,
            delegatee?: true,
            review?: false,
            collaborator_name: "Bob",
            assigned_requirement_block_name: "",
            permit_application: permit_application,
            permit_application_id: "pa-1",
            assigned_requirement_block_id: nil
          )
        end
        let(:audit) do
          build_audit_double(
            user: user,
            auditable: collab,
            auditable_type: "PermitCollaboration",
            action: "create"
          )
        end

        it "returns designated submitter message" do
          expect(formatter.description).to eq("Bob set as designated submitter")
        end
      end

      context "submission assignee" do
        let(:collab) do
          instance_double(
            PermitCollaboration,
            blank?: false,
            submission?: true,
            delegatee?: false,
            review?: false,
            collaborator_name: "Carol",
            assigned_requirement_block_name: "Foundation",
            permit_application: permit_application,
            permit_application_id: "pa-1",
            assigned_requirement_block_id: "block-1"
          )
        end
        let(:audit) do
          build_audit_double(
            user: user,
            auditable: collab,
            auditable_type: "PermitCollaboration",
            action: "create"
          )
        end

        it "returns block assignment message" do
          expect(formatter.description).to eq("Carol assigned to Foundation")
        end
      end

      context "submission assignee with no block name" do
        let(:collab) do
          instance_double(
            PermitCollaboration,
            blank?: false,
            submission?: true,
            delegatee?: false,
            review?: false,
            collaborator_name: "Carol",
            assigned_requirement_block_name: "",
            permit_application: permit_application,
            permit_application_id: "pa-1",
            assigned_requirement_block_id: "block-1"
          )
        end
        let(:audit) do
          build_audit_double(
            user: user,
            auditable: collab,
            auditable_type: "PermitCollaboration",
            action: "create"
          )
        end

        it 'falls back to "requirement block"' do
          expect(formatter.description).to eq(
            "Carol assigned to requirement block"
          )
        end
      end

      context "review collaboration" do
        let(:collab) do
          instance_double(
            PermitCollaboration,
            blank?: false,
            submission?: false,
            delegatee?: false,
            review?: true,
            collaborator_name: "Dave",
            assigned_requirement_block_name: "",
            permit_application: permit_application,
            permit_application_id: "pa-1",
            assigned_requirement_block_id: nil
          )
        end
        let(:audit) do
          build_audit_double(
            user: user,
            auditable: collab,
            auditable_type: "PermitCollaboration",
            action: "create"
          )
        end

        it "returns application assignment message" do
          expect(formatter.description).to eq("Dave assigned to application")
        end
      end

      context "neither submission nor review" do
        let(:collab) do
          instance_double(
            PermitCollaboration,
            blank?: false,
            submission?: false,
            delegatee?: false,
            review?: false,
            collaborator_name: "Eve",
            assigned_requirement_block_name: "",
            permit_application: permit_application,
            permit_application_id: "pa-1",
            assigned_requirement_block_id: nil
          )
        end
        let(:audit) do
          build_audit_double(
            user: user,
            auditable: collab,
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
      context "submission delegatee discard" do
        let(:collab) do
          instance_double(
            PermitCollaboration,
            blank?: false,
            submission?: true,
            delegatee?: true,
            review?: false,
            collaborator_name: "Bob",
            assigned_requirement_block_name: "",
            permit_application: permit_application,
            permit_application_id: "pa-1",
            assigned_requirement_block_id: nil
          )
        end
        let(:audit) do
          build_audit_double(
            user: user,
            auditable: collab,
            auditable_type: "PermitCollaboration",
            action: "update",
            audited_changes: {
              "discarded_at" => [nil, "2026-01-01"]
            }
          )
        end

        it "returns unset designated submitter message" do
          expect(formatter.description).to eq(
            "Bob unset as designated submitter"
          )
        end
      end

      context "submission assignee discard" do
        let(:collab) do
          instance_double(
            PermitCollaboration,
            blank?: false,
            submission?: true,
            delegatee?: false,
            review?: false,
            collaborator_name: "Carol",
            assigned_requirement_block_name: "Foundation",
            permit_application: permit_application,
            permit_application_id: "pa-1",
            assigned_requirement_block_id: "block-1"
          )
        end
        let(:audit) do
          build_audit_double(
            user: user,
            auditable: collab,
            auditable_type: "PermitCollaboration",
            action: "update",
            audited_changes: {
              "discarded_at" => [nil, "2026-01-01"]
            }
          )
        end

        it "returns block unassignment message" do
          expect(formatter.description).to eq(
            "Carol unassigned from Foundation"
          )
        end
      end

      context "review discard" do
        let(:collab) do
          instance_double(
            PermitCollaboration,
            blank?: false,
            submission?: false,
            delegatee?: false,
            review?: true,
            collaborator_name: "Dave",
            assigned_requirement_block_name: "",
            permit_application: permit_application,
            permit_application_id: "pa-1",
            assigned_requirement_block_id: nil
          )
        end
        let(:audit) do
          build_audit_double(
            user: user,
            auditable: collab,
            auditable_type: "PermitCollaboration",
            action: "update",
            audited_changes: {
              "discarded_at" => [nil, "2026-01-01"]
            }
          )
        end

        it "returns application unassignment message" do
          expect(formatter.description).to eq(
            "Dave unassigned from application"
          )
        end
      end
    end

    context 'when action is "update" without discard' do
      let(:collab) do
        instance_double(
          PermitCollaboration,
          blank?: false,
          submission?: true,
          delegatee?: true,
          review?: false,
          collaborator_name: "Bob",
          assigned_requirement_block_name: "",
          permit_application: permit_application,
          permit_application_id: "pa-1",
          assigned_requirement_block_id: nil
        )
      end
      let(:audit) do
        build_audit_double(
          user: user,
          auditable: collab,
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
      let(:collab) do
        instance_double(
          PermitCollaboration,
          blank?: false,
          submission?: true,
          delegatee?: true,
          review?: false,
          collaborator_name: "Bob",
          assigned_requirement_block_name: "",
          permit_application: permit_application,
          permit_application_id: "pa-1",
          assigned_requirement_block_id: nil
        )
      end
      let(:audit) do
        build_audit_double(
          user: user,
          auditable: collab,
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
    let(:collab) do
      instance_double(
        PermitCollaboration,
        permit_application: permit_application,
        blank?: false
      )
    end
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
    let(:collab) do
      instance_double(
        PermitCollaboration,
        permit_application_id: "pa-1",
        blank?: false
      )
    end
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
    let(:collab) do
      instance_double(
        PermitCollaboration,
        assigned_requirement_block_id: "block-99",
        blank?: false
      )
    end
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
