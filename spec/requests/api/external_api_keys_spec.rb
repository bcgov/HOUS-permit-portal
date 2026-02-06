require "rails_helper"

RSpec.describe "Api::ExternalApiKeys", type: :request do
  include Devise::Test::IntegrationHelpers

  let(:jurisdiction) { create(:sub_district, external_api_state: "j_on") }
  let(:review_manager) do
    create(:user, :review_manager, jurisdiction: jurisdiction)
  end
  let(:submitter) { create(:user, :submitter) }
  let(:external_api_key) do
    create(:external_api_key, jurisdiction: jurisdiction)
  end

  describe "GET /api/external_api_keys" do
    it "returns unauthorized when unauthenticated" do
      get "/api/external_api_keys"

      expect(response).to have_http_status(:unauthorized)
    end

    it "returns forbidden for non-authorized users" do
      sign_in submitter

      get "/api/external_api_keys"

      expect(response).to have_http_status(:forbidden)
    end

    it "returns keys for authorized users" do
      sign_in review_manager
      external_api_key

      get "/api/external_api_keys", params: { jurisdiction_id: jurisdiction.id }

      expect(response).to have_http_status(:ok)
      expect(json_response.dig("data")).to be_present
    end
  end

  describe "GET /api/external_api_keys/:id" do
    it "returns key with token for authorized users" do
      sign_in review_manager

      get "/api/external_api_keys/#{external_api_key.id}"

      expect(response).to have_http_status(:ok)
      expect(json_response.dig("data", "token")).to be_present
    end

    it "returns forbidden for unauthorized users" do
      sign_in submitter

      get "/api/external_api_keys/#{external_api_key.id}"

      expect(response).to have_http_status(:forbidden)
    end
  end

  describe "POST /api/external_api_keys" do
    it "creates a key and returns token" do
      sign_in review_manager

      post "/api/external_api_keys",
           params: {
             external_api_key: {
               name: "Integration Key",
               connecting_application: "Integration App",
               expired_at: 1.day.from_now,
               notification_email: "notifications@example.com",
               jurisdiction_id: jurisdiction.id,
               webhook_url: "https://example.com/webhook"
             }
           }

      expect(response).to have_http_status(:ok)
      expect(json_response.dig("data", "token")).to be_present
    end
  end

  describe "PATCH /api/external_api_keys/:id" do
    it "updates an existing key" do
      sign_in review_manager

      patch "/api/external_api_keys/#{external_api_key.id}",
            params: {
              external_api_key: {
                name: "Updated Key",
                expired_at: 2.days.from_now
              }
            }

      expect(response).to have_http_status(:ok)
      expect(json_response.dig("data", "name")).to eq("Updated Key")
    end
  end

  describe "POST /api/external_api_keys/:id/revoke" do
    it "revokes an existing key" do
      sign_in review_manager

      post "/api/external_api_keys/#{external_api_key.id}/revoke"

      expect(response).to have_http_status(:ok)
      expect(json_response.dig("data", "revoked_at")).to be_present
    end
  end

  describe "DELETE /api/external_api_keys/:id" do
    it "deletes an existing key" do
      sign_in review_manager
      external_api_key

      delete "/api/external_api_keys/#{external_api_key.id}"

      expect(response).to have_http_status(:ok)
      expect(ExternalApiKey.where(id: external_api_key.id)).to be_empty
    end
  end
end
