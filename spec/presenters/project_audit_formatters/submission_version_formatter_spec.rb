require "rails_helper"

RSpec.describe ProjectAuditFormatters::SubmissionVersionFormatter do
  let(:user) { instance_double(User, name: "Alice", blank?: false) }
  let(:permit_application) do
    instance_double(PermitApplication, jurisdiction: nil, id: "pa-1")
  end
  let(:submission_version) do
    instance_double(SubmissionVersion, permit_application: permit_application)
  end

  subject(:formatter) { described_class.new(audit, nil) }

  describe "#description" do
    context "when marked as read" do
      let(:audit) do
        build_audit_double(
          user: user,
          auditable: submission_version,
          auditable_type: "SubmissionVersion",
          action: "update",
          audited_changes: {
            "viewed_at" => [nil, Time.current]
          }
        )
      end

      it "returns marked as read message" do
        expect(formatter.description).to eq(
          "Alice marked the application as read"
        )
      end
    end

    context "when marked as unread" do
      let(:audit) do
        build_audit_double(
          user: user,
          auditable: submission_version,
          auditable_type: "SubmissionVersion",
          action: "update",
          audited_changes: {
            "viewed_at" => [Time.current, nil]
          }
        )
      end

      it "returns marked as unread message" do
        expect(formatter.description).to eq(
          "Alice marked the application as unread"
        )
      end
    end
  end
end
