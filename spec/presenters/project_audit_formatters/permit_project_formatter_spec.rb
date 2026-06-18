require "rails_helper"

RSpec.describe ProjectAuditFormatters::PermitProjectFormatter do
  let(:user) { instance_double(User, name: "Alice", blank?: false) }
  let(:viewer) { nil }
  let(:auditable) { instance_double(PermitProject, jurisdiction: nil) }

  subject(:formatter) { described_class.new(audit, viewer) }

  describe "#description" do
    context 'when action is "create"' do
      let(:audit) do
        build_audit_double(
          user: user,
          auditable: auditable,
          auditable_type: "PermitProject",
          action: "create"
        )
      end

      it "returns project creation message" do
        expect(formatter.description).to eq("Alice created this project")
      end
    end

    context 'when action is "update"' do
      context "with full_address change" do
        let(:audit) do
          build_audit_double(
            user: user,
            auditable: auditable,
            auditable_type: "PermitProject",
            action: "update",
            audited_changes: {
              "full_address" => %w[old new]
            }
          )
        end

        it "returns address change message" do
          expect(formatter.description).to eq(
            "Alice changed the project address"
          )
        end
      end

      context "with title change" do
        let(:audit) do
          build_audit_double(
            user: user,
            auditable: auditable,
            auditable_type: "PermitProject",
            action: "update",
            audited_changes: {
              "title" => %w[old new]
            }
          )
        end

        it "returns name change message" do
          expect(formatter.description).to eq("Alice changed the project name")
        end
      end

      context "with state change" do
        let(:audit) do
          build_audit_double(
            user: user,
            auditable: auditable,
            auditable_type: "PermitProject",
            action: "update",
            audited_changes: {
              "state" => [
                PermitProject.states["queued"],
                PermitProject.states["in_progress"]
              ]
            }
          )
        end

        it "returns state change message with old and new labels" do
          expect(formatter.description).to eq(
            "Alice changed project state from Queued to In Progress"
          )
        end
      end

      context "when marked as read" do
        let(:audit) do
          build_audit_double(
            user: user,
            auditable: auditable,
            auditable_type: "PermitProject",
            action: "update",
            audited_changes: {
              "viewed_at" => [nil, Time.current]
            }
          )
        end

        it "returns marked as read message" do
          expect(formatter.description).to eq(
            "Alice marked the project as read"
          )
        end
      end

      context "when marked as unread" do
        let(:audit) do
          build_audit_double(
            user: user,
            auditable: auditable,
            auditable_type: "PermitProject",
            action: "update",
            audited_changes: {
              "viewed_at" => [Time.current, nil]
            }
          )
        end

        it "returns marked as unread message" do
          expect(formatter.description).to eq(
            "Alice marked the project as unread"
          )
        end
      end

      context "with other changes" do
        let(:audit) do
          build_audit_double(
            user: user,
            auditable: auditable,
            auditable_type: "PermitProject",
            action: "update",
            audited_changes: {
              "some_field" => %w[old new]
            }
          )
        end

        it "returns generic update message" do
          expect(formatter.description).to eq("Alice updated the project")
        end
      end
    end

    context "with an unrecognized action" do
      let(:audit) do
        build_audit_double(
          user: user,
          auditable: auditable,
          auditable_type: "PermitProject",
          action: "destroy"
        )
      end

      it "returns the i18n fallback" do
        expect(formatter.description).to eq("Alice made a change")
      end
    end
  end
end
