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
          :open,
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
          build(:project_meeting, :open, requester_relationship: relationship)

        expect(meeting).not_to be_valid
        expect(meeting.errors[:meeting_request_documents]).to be_present
      end
    end

    it "allows non-owner requesters to submit with authorization documents" do
      meeting =
        build(
          :project_meeting,
          :open,
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
          :open,
          requester_relationship: :owner_or_landholder
        )

      expect(meeting).to be_valid
    end

    it "requires a confirmed date when scheduled" do
      meeting = build(:project_meeting, :scheduled, confirmed_date: nil)

      expect(meeting).not_to be_valid
      expect(meeting.errors[:confirmed_date]).to be_present
    end

    it "requires a contact method when scheduled" do
      meeting = build(:project_meeting, :scheduled, contact_method: nil)

      expect(meeting).not_to be_valid
      expect(meeting.errors[:contact_method]).to be_present
    end

    it "requires a meeting link for videoconference meetings" do
      meeting =
        build(
          :project_meeting,
          :scheduled,
          contact_method: :videoconference,
          meeting_url: nil
        )

      expect(meeting).not_to be_valid
      expect(meeting.errors[:meeting_url]).to be_present
    end

    it "allows only one active meeting request per project" do
      permit_project = create(:permit_project)
      create(:project_meeting, permit_project: permit_project)

      meeting = build(:project_meeting, permit_project: permit_project)

      expect(meeting).not_to be_valid
      expect(meeting.errors[:permit_project]).to be_present
    end

    it "allows a new active request after the prior request is scheduled" do
      permit_project = create(:permit_project)
      create(:project_meeting, :scheduled, permit_project: permit_project)

      meeting = build(:project_meeting, permit_project: permit_project)

      expect(meeting).to be_valid
    end
  end

  describe "#submit_request!" do
    it "opens the meeting request and marks the project unviewed" do
      meeting = create(:project_meeting)
      meeting.permit_project.update!(viewed_at: Time.current)

      meeting.submit_request!

      expect(meeting.reload).to be_open
      expect(meeting).to be_submitted
      expect(meeting.submitted_at).to be_present
      expect(meeting.permit_project.reload.viewed_at).to be_nil
    end

    it "does not submit without authorization documents for non-owner requesters" do
      meeting =
        create(:project_meeting, requester_relationship: :leaseholder_or_tenant)

      expect { meeting.submit_request! }.to raise_error(AASM::InvalidTransition)
      expect(meeting.reload).to be_draft
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
      create(
        :meeting_submission_contact,
        jurisdiction: meeting.permit_project.jurisdiction,
        email: "meetings@example.com"
      )

      expect { meeting.submit_request! }.to have_enqueued_mail(
        PermitHubMailer,
        :notify_project_meeting_submitted_to_jurisdiction
      ).with(meeting, "meetings@example.com")
    end

    it "enqueues property information notifications when enabled and requested" do
      meeting = create(:project_meeting, request_property_information: true)
      create(
        :property_information_submission_contact,
        jurisdiction: meeting.permit_project.jurisdiction,
        email: "property-info@example.com"
      )
      meeting.permit_project.jurisdiction.update!(
        property_information_requests_enabled: true
      )

      expect { meeting.submit_request! }.to have_enqueued_mail(
        PermitHubMailer,
        :notify_property_information_requested
      ).with(meeting, "property-info@example.com")
    end

    it "does not enqueue property information notifications when not requested" do
      meeting = create(:project_meeting, request_property_information: false)
      create(
        :property_information_submission_contact,
        jurisdiction: meeting.permit_project.jurisdiction,
        email: "property-info@example.com"
      )
      meeting.permit_project.jurisdiction.update!(
        property_information_requests_enabled: true
      )

      expect { meeting.submit_request! }.not_to have_enqueued_mail(
        PermitHubMailer,
        :notify_property_information_requested
      )
    end
  end

  describe "status transitions" do
    it "schedules an open meeting request" do
      meeting =
        create(
          :project_meeting,
          :open,
          contact_method: :phone,
          confirmed_date: 1.week.from_now
        )

      meeting.schedule!

      expect(meeting.reload).to be_scheduled
      expect(meeting.scheduled_at).to be_present
    end

    it "enqueues a scheduled meeting email for the requester" do
      meeting =
        create(
          :project_meeting,
          :open,
          contact_method: :phone,
          confirmed_date: 1.week.from_now
        )

      expect { meeting.schedule! }.to have_enqueued_mail(
        PermitHubMailer,
        :notify_project_meeting_scheduled
      ).with(meeting)
    end

    it "enqueues scheduled meeting emails for jurisdiction contacts" do
      meeting =
        create(
          :project_meeting,
          :open,
          contact_method: :phone,
          confirmed_date: 1.week.from_now
        )
      create(
        :meeting_submission_contact,
        jurisdiction: meeting.permit_project.jurisdiction,
        email: "meetings@example.com"
      )

      expect { meeting.schedule! }.to have_enqueued_mail(
        PermitHubMailer,
        :notify_project_meeting_scheduled_to_jurisdiction
      ).with(meeting, "meetings@example.com")
    end

    it "does not schedule without a confirmed date" do
      meeting =
        create(
          :project_meeting,
          :open,
          contact_method: :phone,
          confirmed_date: nil
        )

      expect { meeting.schedule! }.to raise_error(AASM::InvalidTransition)
      expect(meeting.reload).to be_open
    end

    it "completes a scheduled meeting request" do
      meeting = create(:project_meeting, :scheduled)

      meeting.complete!

      expect(meeting.reload).to be_completed
      expect(meeting.completed_at).to be_present
    end

    it "closes an open meeting request" do
      meeting = create(:project_meeting, :open)

      meeting.close!

      expect(meeting.reload).to be_closed
      expect(meeting.closed_at).to be_present
    end

    it "blocks invalid transitions" do
      meeting = create(:project_meeting, :open)

      expect { meeting.complete! }.to raise_error(AASM::InvalidTransition)
    end
  end
end
