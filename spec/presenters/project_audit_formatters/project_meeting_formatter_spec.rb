require "rails_helper"

RSpec.describe ProjectAuditFormatters::ProjectMeetingFormatter do
  let(:user) { instance_double(User, name: "Alice", blank?: false) }
  let(:viewer) { nil }
  let(:auditable) { instance_double(ProjectMeeting, jurisdiction: nil) }

  subject(:formatter) { described_class.new(audit, viewer) }

  describe "#description" do
    {
      "open" => "Alice submitted a project meeting request",
      "scheduled" => "Alice scheduled the project meeting",
      "completed" => "Alice completed the project meeting",
      "closed" => "Alice cancelled the project meeting"
    }.each do |status, message|
      context "when status changes to #{status}" do
        let(:audit) do
          build_audit_double(
            user: user,
            auditable: auditable,
            auditable_type: "ProjectMeeting",
            action: "update",
            audited_changes: {
              "status" => [ProjectMeeting.statuses["draft"], status]
            }
          )
        end

        it "returns the lifecycle message" do
          expect(formatter.description).to eq(message)
        end
      end
    end

    context "when schedule details change without a status change" do
      let(:audit) do
        build_audit_double(
          user: user,
          auditable: auditable,
          auditable_type: "ProjectMeeting",
          action: "update",
          audited_changes: {
            "confirmed_date" => [1.week.from_now, 2.weeks.from_now]
          }
        )
      end

      it "returns the reschedule message" do
        expect(formatter.description).to eq(
          "Alice rescheduled the project meeting"
        )
      end
    end

    context "when a submitter views a staff user's meeting action" do
      let(:jurisdiction) do
        instance_double(
          Jurisdiction,
          qualified_name: "City Hall",
          id: 1,
          present?: true
        )
      end
      let(:staff_user) do
        instance_double(
          User,
          name: "Staff Person",
          blank?: false,
          jurisdiction_staff?: true
        )
      end
      let(:submitter_viewer) do
        instance_double(User, submitter?: true, present?: true)
      end
      let(:auditable) do
        instance_double(ProjectMeeting, jurisdiction: jurisdiction)
      end
      let(:viewer) { submitter_viewer }
      let(:audit) do
        build_audit_double(
          user: staff_user,
          auditable: auditable,
          auditable_type: "ProjectMeeting",
          action: "update",
          audited_changes: {
            "status" => [
              ProjectMeeting.statuses["open"],
              ProjectMeeting.statuses["scheduled"]
            ]
          }
        )
      end

      before do
        allow(staff_user).to receive(:member_of?).with(
          jurisdiction.id
        ).and_return(true)
      end

      it "masks the staff name with the jurisdiction name" do
        expect(formatter.description).to eq(
          "City Hall scheduled the project meeting"
        )
      end
    end
  end
end
