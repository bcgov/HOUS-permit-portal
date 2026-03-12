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
      existing = double("ExistingDelegatees", length: 1, destroy_all: true)
      allow(permit_collaborations_assoc).to receive(:where).with(
        collaborator_type: "delegatee"
      ).and_return(existing)

      collaborator = instance_double("Collaborator")
      allow(Collaborator).to receive(:find).with("c1").and_return(collaborator)

      permit_collaboration =
        instance_double("PermitCollaboration", save: true, submission?: false)
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

      expect(existing).to have_received(:destroy_all)
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

    it "sends submission collaboration email for submission collaborations" do
      allow(permit_collaborations_assoc).to receive(:where).and_return(
        double(length: 0)
      )
      allow(Collaborator).to receive(:find).and_return(
        instance_double("Collaborator")
      )

      user =
        instance_double(
          "User",
          discarded?: false,
          confirmed?: true,
          submitter?: true
        )
      collaborator = instance_double("Collaborator", user: user)
      permit_collaboration =
        instance_double(
          "PermitCollaboration",
          save: true,
          submission?: true,
          collaborator: collaborator
        )
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

  describe "#send_submission_collaboration_email!" do
    it "raises when user must be submitter for registration path" do
      user =
        instance_double(
          "User",
          discarded?: true,
          confirmed?: false,
          submitter?: false
        )
      collab =
        instance_double(
          "PermitCollaboration",
          collaborator: instance_double("Collaborator", user: user)
        )
      allow(I18n).to receive(:t).and_return("err")

      expect do
        service.send(:send_submission_collaboration_email!, collab)
      end.to raise_error(PermitCollaborationError)
    end

    it "sends new/unconfirmed mail when registration is needed" do
      user =
        instance_double(
          "User",
          discarded?: true,
          confirmed?: false,
          submitter?: true
        )
      collab =
        instance_double(
          "PermitCollaboration",
          collaborator: instance_double("Collaborator", user: user)
        )

      mail = instance_double("MailerMessage", deliver_later: true)
      allow(PermitHubMailer).to receive(
        :notify_new_or_unconfirmed_permit_collaboration
      ).and_return(mail)

      service.send(:send_submission_collaboration_email!, collab)

      expect(PermitHubMailer).to have_received(
        :notify_new_or_unconfirmed_permit_collaboration
      )
    end
  end

  describe "#invite_new_submission_collaborator!" do
    it "creates user if not found, creates collaborator, and assigns collaboration" do
      collaborators_assoc = double("CollaboratorsAssoc")
      inviter = instance_double("User", collaborators: collaborators_assoc)
      user_params = { email: "x@example.com", first_name: "X", last_name: "Y" }

      allow(User).to receive_message_chain(:where, :or, :first).and_return(nil)
      created_user = instance_double("User", save: true)
      allow(User).to receive(:build).and_return(created_user)

      collaborator = instance_double("Collaborator", id: "col-1", save: true)
      allow(collaborators_assoc).to receive(:build).with(
        user: created_user
      ).and_return(collaborator)

      permit_collaboration = instance_double("PermitCollaboration")
      allow(service).to receive(:assign_collaborator!).and_return(
        permit_collaboration
      )

      result =
        service.invite_new_submission_collaborator!(
          inviter: inviter,
          user_params: user_params,
          collaborator_type: "delegatee"
        )

      expect(result).to eq(permit_collaboration)
    end
  end
end
