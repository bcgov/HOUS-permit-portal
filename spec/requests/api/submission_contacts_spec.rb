require "rails_helper"

RSpec.describe "Api::SubmissionContacts", type: :request do
  include Devise::Test::IntegrationHelpers

  let(:jurisdiction) { create(:sub_district) }
  let(:review_manager) do
    create(:user, :review_manager, jurisdiction: jurisdiction)
  end
  let(:headers) { { "ACCEPT" => "application/json" } }

  before { sign_in review_manager }

  describe "POST /api/submission_contacts" do
    [
      %w[ApplicationSubmissionContact inbox@example.com],
      %w[MeetingSubmissionContact meetings@example.com],
      %w[PropertyInformationSubmissionContact property@example.com]
    ].each do |type, email|
      it "creates an unconfirmed #{type}" do
        expect {
          post "/api/submission_contacts",
               params: {
                 submission_contact: {
                   jurisdiction_id: jurisdiction.id,
                   email: email,
                   type: type
                 }
               },
               headers: headers,
               as: :json
        }.to have_enqueued_mail(PermitHubMailer, :submission_contact_confirm)

        expect(response).to have_http_status(:ok)
        expect(json_response.dig("data", "email")).to eq(email)
        expect(json_response.dig("data", "type")).to eq(type)
        expect(json_response.dig("data", "confirmed_at")).to be_nil
        expect(
          type.constantize.find_by(email: email, jurisdiction: jurisdiction)
        ).to be_present
      end
    end

    it "returns a validation error for a duplicate email" do
      existing = jurisdiction.application_submission_contacts.first

      post "/api/submission_contacts",
           params: {
             submission_contact: {
               jurisdiction_id: jurisdiction.id,
               email: existing.email,
               type: "ApplicationSubmissionContact"
             }
           },
           headers: headers,
           as: :json

      expect(response).to have_http_status(:bad_request)
      expect(json_response.dig("meta", "message", "message")).to include(
        "already been taken"
      )
      expect(jurisdiction.application_submission_contacts.count).to eq(1)
    end
  end

  describe "POST /api/submission_contacts/:id/resend_confirmation" do
    it "sends a new confirmation for an unconfirmed contact" do
      contact =
        create(
          :meeting_submission_contact,
          jurisdiction: jurisdiction,
          confirmed_at: nil
        )
      original_token = contact.reload.confirmation_token

      expect {
        post "/api/submission_contacts/#{contact.id}/resend_confirmation",
             headers: headers
      }.to have_enqueued_mail(PermitHubMailer, :submission_contact_confirm)

      expect(response).to have_http_status(:ok)
      contact.reload
      expect(contact.confirmation_token).not_to eq(original_token)
      expect(contact.confirmation_sent_at).to be_present
      expect(contact.confirmed_at).to be_nil
    end

    it "rejects a contact that is already verified" do
      contact = jurisdiction.application_submission_contacts.first

      expect {
        post "/api/submission_contacts/#{contact.id}/resend_confirmation",
             headers: headers
      }.not_to have_enqueued_mail(PermitHubMailer, :submission_contact_confirm)

      expect(response).to have_http_status(:bad_request)
      expect(json_response.dig("meta", "message", "message")).to eq(
        "This email address is already verified"
      )
      expect(contact.reload.confirmed_at).to be_present
    end
  end

  describe "DELETE /api/submission_contacts/:id" do
    it "removes a meeting contact when project meetings are off" do
      contact = create(:meeting_submission_contact, jurisdiction: jurisdiction)

      delete "/api/submission_contacts/#{contact.id}", headers: headers

      expect(response).to have_http_status(:ok)
      expect(MeetingSubmissionContact.exists?(contact.id)).to be(false)
    end

    it "returns the last confirmed contact error" do
      contact = jurisdiction.application_submission_contacts.first

      delete "/api/submission_contacts/#{contact.id}", headers: headers

      expect(response).to have_http_status(:bad_request)
      expect(json_response.dig("meta", "message", "message")).to include(
        "cannot be deleted while submission inbox is enabled"
      )
      expect(ApplicationSubmissionContact.exists?(contact.id)).to be(true)
    end
  end
end
