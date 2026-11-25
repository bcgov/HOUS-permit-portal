require "rails_helper"

RSpec.describe "Api::PermitCollaborations", type: :request do
  include Devise::Test::IntegrationHelpers

  let(:headers) { { "ACCEPT" => "application/json" } }
  let(:jurisdiction) { create(:sub_district) }
  let(:reviewer) { create(:user, :reviewer, jurisdiction: jurisdiction) }
  let(:permit_application) do
    create(:permit_application, :newly_submitted, jurisdiction: jurisdiction)
  end
  let(:collaborator) { jurisdiction.collaborators.find_by!(user: reviewer) }
  let(:permit_collaboration) do
    create(
      :permit_collaboration,
      permit_application: permit_application,
      collaborator: collaborator,
      collaborator_type: :delegatee
    )
  end

  before { sign_in reviewer }

  describe "DELETE /api/permit_collaborations/:id" do
    it "discards a collaboration for review staff in the jurisdiction" do
      delete "/api/permit_collaborations/#{permit_collaboration.id}",
             headers: headers

      expect(response).to have_http_status(:ok)
      expect(permit_collaboration.reload.discarded?).to be(true)
    end

    it "forbids unrelated users" do
      sign_in create(:user, :submitter)

      delete "/api/permit_collaborations/#{permit_collaboration.id}",
             headers: headers

      expect(response).to have_http_status(:forbidden)
    end
  end

  describe "POST /api/permit_collaborations/:id/reinvite" do
    it "resends the review collaboration email" do
      mail = instance_double("MailerMessage", deliver_later: true)
      allow(PermitHubMailer).to receive(
        :notify_permit_collaboration
      ).and_return(mail)

      post "/api/permit_collaborations/#{permit_collaboration.id}/reinvite",
           headers: headers

      expect(response).to have_http_status(:ok)
      expect(PermitHubMailer).to have_received(
        :notify_permit_collaboration
      ).with(permit_collaboration: permit_collaboration)
    end

    it "forbids unrelated users" do
      sign_in create(:user, :submitter)

      post "/api/permit_collaborations/#{permit_collaboration.id}/reinvite",
           headers: headers

      expect(response).to have_http_status(:forbidden)
    end
  end
end
