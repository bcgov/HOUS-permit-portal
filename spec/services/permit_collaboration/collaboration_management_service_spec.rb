require "rails_helper"

RSpec.describe PermitCollaboration::CollaborationManagementService do
  before do
    unless defined?(PermitCollaborationError)
      stub_const("PermitCollaborationError", Class.new(StandardError))
    end
    allow(ActiveRecord::Base).to receive(:transaction).and_yield
  end

  let(:permit_application) do
    instance_double(
      "PermitApplication",
      permit_collaborations: permit_collaborations_assoc
    )
  end

  let(:permit_collaborations_assoc) { double("PermitCollaborationsAssoc") }

  let(:service) { described_class.new(permit_application) }

  describe "#assign_collaborator!" do
    it "removes existing delegatee collaborations before saving a new one" do
      existing = double("ExistingDelegatees", length: 1, discard_all: true)
      allow(permit_collaborations_assoc).to receive(:where).with(
        collaborator_type: "delegatee"
      ).and_return(existing)

      collaborator = instance_double("Collaborator")
      allow(Collaborator).to receive(:find).with("c1").and_return(collaborator)

      permit_collaboration = instance_double("PermitCollaboration", save: true)
      allow(permit_collaborations_assoc).to receive(:build).and_return(
        permit_collaboration
      )

      mail = instance_double("MailerMessage", deliver_later: true)
      allow(PermitHubMailer).to receive(
        :notify_permit_collaboration
      ).and_return(mail)
      allow(NotificationService).to receive(
        :publish_permit_collaboration_assignment_event
      )

      result =
        service.assign_collaborator!(
          collaborator_id: "c1",
          collaborator_type: "delegatee"
        )

      expect(existing).to have_received(:discard_all)
      expect(permit_collaboration).to eq(result)
    end

    it "yields to authorize_collaboration callback and raises on save failure" do
      allow(permit_collaborations_assoc).to receive(:where).and_return(
        double(length: 0)
      )
      allow(Collaborator).to receive(:find).and_return(
        instance_double("Collaborator")
      )

      errors = double("Errors", full_messages: ["bad"])
      permit_collaboration =
        instance_double("PermitCollaboration", save: false, errors: errors)
      allow(permit_collaborations_assoc).to receive(:build).and_return(
        permit_collaboration
      )
      allow(I18n).to receive(:t).and_return("msg")

      authorized = false
      authorize = ->(_pc) { authorized = true }

      expect do
        service.assign_collaborator!(
          authorize_collaboration: authorize,
          collaborator_id: "c1",
          collaborator_type: "assignee"
        )
      end.to raise_error(PermitCollaborationError)

      expect(authorized).to eq(true)
    end

    it "sends the collaboration email" do
      allow(permit_collaborations_assoc).to receive(:where).and_return(
        double(length: 0)
      )
      allow(Collaborator).to receive(:find).and_return(
        instance_double("Collaborator")
      )

      permit_collaboration = instance_double("PermitCollaboration", save: true)
      allow(permit_collaborations_assoc).to receive(:build).and_return(
        permit_collaboration
      )

      mail = instance_double("MailerMessage", deliver_later: true)
      allow(PermitHubMailer).to receive(
        :notify_permit_collaboration
      ).and_return(mail)
      allow(NotificationService).to receive(
        :publish_permit_collaboration_assignment_event
      )

      service.assign_collaborator!(
        collaborator_id: "c1",
        collaborator_type: "assignee"
      )

      expect(PermitHubMailer).to have_received(:notify_permit_collaboration)
    end
  end

  describe "#reinvite!" do
    it "resends the collaboration email" do
      permit_collaboration = instance_double("PermitCollaboration")
      mail = instance_double("MailerMessage", deliver_later: true)
      allow(PermitHubMailer).to receive(
        :notify_permit_collaboration
      ).and_return(mail)

      service.reinvite!(permit_collaboration)

      expect(PermitHubMailer).to have_received(
        :notify_permit_collaboration
      ).with(permit_collaboration: permit_collaboration)
      expect(mail).to have_received(:deliver_later)
    end
  end
end
