require "rails_helper"

RSpec.describe "Api::Collaborators", type: :request, search: true do
  include Devise::Test::IntegrationHelpers

  let(:headers) { { "ACCEPT" => "application/json" } }
  let(:jurisdiction) { create(:sub_district) }
  let(:owner) { create(:user, :reviewer, jurisdiction: jurisdiction) }
  let!(:collaborators) do
    create_list(:user, 2, :reviewer, jurisdiction: jurisdiction)
    jurisdiction.collaborators.to_a
  end

  before do
    sign_in owner
    Collaborator.reindex
  end

  describe "POST /api/collaborators/jurisdictions/:jurisdiction_id/search" do
    it "returns paginated collaborator results" do
      post "/api/collaborators/jurisdictions/#{jurisdiction.id}/search",
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

      post "/api/collaborators/jurisdictions/#{jurisdiction.id}/search",
           headers: headers,
           as: :json

      expect(response).to have_http_status(:ok)
      expect(json_response["data"]).to be_empty
    end
  end
end
