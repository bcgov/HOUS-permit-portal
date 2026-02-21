require "rails_helper"

RSpec.describe "Api::Collaborators", type: :request, search: true do
  include Devise::Test::IntegrationHelpers

  let(:headers) { { "ACCEPT" => "application/json" } }
  let(:collaboratorable) { create(:user, :submitter) }
  let(:owner) { collaboratorable }
  let!(:collaborators) do
    create_list(:collaborator, 3, collaboratorable: collaboratorable)
  end

  before do
    sign_in owner
    Collaborator.reindex
  end

  describe "POST /api/collaborators/collaboratorable/:collaboratorable_id/search" do
    it "returns paginated collaborator results" do
      post "/api/collaborators/collaboratorable/#{collaboratorable.id}/search",
           params: {
             page: 1,
             per_page: 2
           },
           headers: headers,
           as: :json

      expect(response).to have_http_status(:ok)
      expect(json_response).to include("data", "meta")
      expect(json_response["data"].size).to eq(2)
    end

    it "filters out results for unauthorized users" do
      sign_in create(:user, :submitter)

      post "/api/collaborators/collaboratorable/#{collaboratorable.id}/search",
           headers: headers,
           as: :json

      expect(response).to have_http_status(:ok)
      expect(json_response["data"]).to be_empty
    end
  end
end
