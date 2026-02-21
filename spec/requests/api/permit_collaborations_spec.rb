require "rails_helper"

RSpec.describe "Api::PermitCollaborations", type: :request do
  include Devise::Test::IntegrationHelpers

  let(:headers) { { "ACCEPT" => "application/json" } }
  let(:submitter) { create(:user, :submitter) }
  let(:collaboration_user) { create(:user, :submitter) }
  let(:permit_application) { create(:permit_application, submitter: submitter) }
  let(:collaborator) do
    create(:collaborator, user: collaboration_user, collaboratorable: submitter)
  end
  let(:permit_collaboration) do
    create(
      :permit_collaboration,
      permit_application: permit_application,
      collaborator: collaborator,
      collaboration_type: :submission,
      collaborator_type: :delegatee
    )
  end

  before { sign_in submitter }

  describe "DELETE /api/permit_collaborations/:id" do
    it "destroys a collaboration for submitters" do
      delete "/api/permit_collaborations/#{permit_collaboration.id}",
             headers: headers

      expect(response).to have_http_status(:ok)
      expect(PermitCollaboration.exists?(permit_collaboration.id)).to be(false)
    end

    it "forbids unrelated users" do
      sign_in create(:user, :submitter)

      delete "/api/permit_collaborations/#{permit_collaboration.id}",
             headers: headers

      expect(response).to have_http_status(:forbidden)
    end
  end

  describe "POST /api/permit_collaborations/:id/reinvite" do
    it "reinvites a submission collaborator" do
      service =
        instance_double(PermitCollaboration::CollaborationManagementService)

      allow(PermitCollaboration::CollaborationManagementService).to receive(
        :new
      ).and_return(service)
      allow(service).to receive(:send_submission_collaboration_email!)

      post "/api/permit_collaborations/#{permit_collaboration.id}/reinvite",
           headers: headers

      expect(response).to have_http_status(:ok)
      expect(service).to have_received(:send_submission_collaboration_email!)
    end

    it "returns errors when the service fails" do
      service =
        instance_double(PermitCollaboration::CollaborationManagementService)

      allow(PermitCollaboration::CollaborationManagementService).to receive(
        :new
      ).and_return(service)
      allow(service).to receive(
        :send_submission_collaboration_email!
      ).and_raise(PermitCollaborationError, "boom")

      post "/api/permit_collaborations/#{permit_collaboration.id}/reinvite",
           headers: headers

      expect(response).to have_http_status(:bad_request)
      expect(json_response.dig("meta", "message", "message")).to be_present
    end
  end
end
