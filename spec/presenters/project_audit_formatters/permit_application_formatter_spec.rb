require "rails_helper"

RSpec.describe ProjectAuditFormatters::PermitApplicationFormatter do
  let(:user) { instance_double(User, name: "Alice", blank?: false) }
  let(:viewer) { nil }
  let(:submitter) { instance_double(User, name: "Bob Submitter") }
  let(:jurisdiction) do
    instance_double(Jurisdiction, qualified_name: "Test City", id: 1)
  end
  let(:auditable) do
    instance_double(
      PermitApplication,
      nickname: "My Permit",
      submitter: submitter,
      jurisdiction: jurisdiction
    )
  end

  subject(:formatter) { described_class.new(audit, viewer) }

  describe "#description" do
    context 'when action is "create"' do
      let(:audit) do
        build_audit_double(
          user: user,
          auditable: auditable,
          auditable_type: "PermitApplication",
          action: "create"
        )
      end

      it "returns creation message with permit name" do
        expect(formatter.description).to eq("Alice created permit My Permit")
      end
    end

    context 'when action is "create" and auditable is nil' do
      let(:audit) do
        build_audit_double(
          user: user,
          auditable: nil,
          auditable_type: "PermitApplication",
          action: "create"
        )
      end

      it 'falls back to "permit" as name' do
        expect(formatter.description).to eq("Alice created permit permit")
      end
    end

    context 'when action is "update"' do
      context "with a discard (discarded_at change)" do
        let(:audit) do
          build_audit_double(
            user: user,
            auditable: auditable,
            auditable_type: "PermitApplication",
            action: "update",
            audited_changes: {
              "discarded_at" => [nil, "2026-01-01"]
            }
          )
        end

        it "returns removal message" do
          expect(formatter.description).to eq("Alice removed permit My Permit")
        end
      end

      context "with status change to newly_submitted" do
        let(:audit) do
          build_audit_double(
            user: user,
            auditable: auditable,
            auditable_type: "PermitApplication",
            action: "update",
            audited_changes: {
              "status" => [0, PermitApplication.statuses["newly_submitted"]]
            }
          )
        end

        it "returns submission message" do
          expect(formatter.description).to eq("Alice submitted the application")
        end
      end

      context "with status change to resubmitted" do
        let(:audit) do
          build_audit_double(
            user: user,
            auditable: auditable,
            auditable_type: "PermitApplication",
            action: "update",
            audited_changes: {
              "status" => [0, PermitApplication.statuses["resubmitted"]]
            }
          )
        end

        it "returns resubmission message with submitter name" do
          expect(formatter.description).to eq(
            "Bob Submitter resubmitted the application"
          )
        end
      end

      context "with status change to revisions_requested" do
        let(:audit) do
          build_audit_double(
            user: user,
            auditable: auditable,
            auditable_type: "PermitApplication",
            action: "update",
            audited_changes: {
              "status" => [0, PermitApplication.statuses["revisions_requested"]]
            }
          )
        end

        it "returns revisions requested message" do
          expect(formatter.description).to eq(
            "Revisions requested — sent to submitter"
          )
        end
      end

      context "with status change to an unrecognized value" do
        let(:audit) do
          build_audit_double(
            user: user,
            auditable: auditable,
            auditable_type: "PermitApplication",
            action: "update",
            audited_changes: {
              "status" => [0, 999]
            }
          )
        end

        it "returns generic status change message" do
          expect(formatter.description).to eq(
            "Alice changed the application status"
          )
        end
      end

      context "with reference_number change" do
        let(:audit) do
          build_audit_double(
            user: user,
            auditable: auditable,
            auditable_type: "PermitApplication",
            action: "update",
            audited_changes: {
              "reference_number" => [nil, "REF-123"]
            }
          )
        end

        it "returns reference number assignment message" do
          expect(formatter.description).to eq(
            "Reference number REF-123 assigned"
          )
        end
      end

      context "with other changes" do
        let(:audit) do
          build_audit_double(
            user: user,
            auditable: auditable,
            auditable_type: "PermitApplication",
            action: "update",
            audited_changes: {
              "some_field" => %w[old new]
            }
          )
        end

        it "returns generic update message" do
          expect(formatter.description).to eq("Alice updated the application")
        end
      end
    end

    context "with an unrecognized action" do
      let(:audit) do
        build_audit_double(
          user: user,
          auditable: auditable,
          auditable_type: "PermitApplication",
          action: "destroy"
        )
      end

      it "returns the i18n fallback" do
        expect(formatter.description).to eq(
          "Alice made a change to the application"
        )
      end
    end
  end

  describe "#permit_application" do
    let(:audit) do
      build_audit_double(
        user: user,
        auditable: auditable,
        auditable_type: "PermitApplication",
        action: "create"
      )
    end

    it "returns the auditable" do
      expect(formatter.permit_application).to eq(auditable)
    end
  end

  describe "#permit_application_id" do
    let(:audit) do
      build_audit_double(
        user: user,
        auditable: auditable,
        auditable_type: "PermitApplication",
        auditable_id: "pa-42",
        action: "create"
      )
    end

    it "returns the auditable_id" do
      expect(formatter.permit_application_id).to eq("pa-42")
    end
  end
end
