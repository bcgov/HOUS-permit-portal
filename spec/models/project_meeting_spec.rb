require "rails_helper"

RSpec.describe ProjectMeeting, type: :model do
  describe "associations" do
    subject { build(:project_meeting) }

    it { should belong_to(:permit_project) }
    it { should belong_to(:requested_by).class_name("User") }
    it { should have_many(:meeting_request_documents).dependent(:destroy) }
  end

  describe "validations" do
    it { should validate_presence_of(:permit_project) }
    it { should validate_presence_of(:requested_by) }
    it { should validate_presence_of(:status) }

    it "requires complete request fields when submitted" do
      meeting =
        build(
          :project_meeting,
          :submitted,
          requester_relationship: nil,
          contact_name: nil,
          contact_email: nil,
          project_description: nil,
          request_property_information: nil
        )

      expect(meeting).not_to be_valid
      expect(meeting.errors[:requester_relationship]).to be_present
      expect(meeting.errors[:contact_name]).to be_present
      expect(meeting.errors[:contact_email]).to be_present
      expect(meeting.errors[:project_description]).to be_present
      expect(meeting.errors[:request_property_information]).to be_present
    end

    %i[leaseholder_or_tenant owners_representative other].each do |relationship|
      it "requires authorization documents when submitted by #{relationship}" do
        meeting =
          build(
            :project_meeting,
            :submitted,
            requester_relationship: relationship
          )

        expect(meeting).not_to be_valid
        expect(meeting.errors[:meeting_request_documents]).to be_present
      end
    end

    it "allows non-owner requesters to submit with authorization documents" do
      meeting =
        build(
          :project_meeting,
          :submitted,
          requester_relationship: :owners_representative
        )
      meeting.meeting_request_documents.build(
        attributes_for(:meeting_request_document, :authorization)
      )

      expect(meeting).to be_valid
    end

    it "allows owners to submit without authorization documents" do
      meeting =
        build(
          :project_meeting,
          :submitted,
          requester_relationship: :owner_or_landholder
        )

      expect(meeting).to be_valid
    end
  end

  describe "#submit_request!" do
    it "marks the meeting as submitted and marks the project unviewed" do
      meeting = create(:project_meeting)
      meeting.permit_project.update!(viewed_at: Time.current)

      meeting.submit_request!

      expect(meeting.reload).to be_submitted
      expect(meeting.submitted_at).to be_present
      expect(meeting.permit_project.reload.viewed_at).to be_nil
    end

    it "enqueues a confirmation email" do
      meeting = create(:project_meeting)

      expect { meeting.submit_request! }.to have_enqueued_mail(
        PermitHubMailer,
        :notify_project_meeting_submitted
      ).with(meeting)
    end

    it "enqueues jurisdiction recipient notifications" do
      meeting = create(:project_meeting)
      meeting.permit_project.jurisdiction.update!(
        project_meeting_notification_recipient_emails: ["meetings@example.com"]
      )

      expect { meeting.submit_request! }.to have_enqueued_mail(
        PermitHubMailer,
        :notify_project_meeting_submitted_to_jurisdiction
      ).with(meeting, "meetings@example.com")
    end
  end
end
