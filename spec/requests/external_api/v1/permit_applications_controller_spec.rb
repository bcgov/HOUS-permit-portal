require "rails_helper"

RSpec.describe "External API v1 permit applications", type: :request do
  let(:external_api_key) { create(:external_api_key) }

  def auth_headers(token: nil)
    {
      "Authorization" => "Bearer #{token || external_api_key.token}",
      "Content-Type" => "application/json"
    }
  end

  describe "POST /external_api/v1/permit_applications/search" do
    it "returns 401 without token" do
      post "/external_api/v1/permit_applications/search", params: {}.to_json
      expect(response).to have_http_status(:unauthorized)
    end

    it "returns results scoped by policy (jurisdiction + submitted + sandbox)" do
      allowed =
        create(
          :permit_application,
          :newly_submitted,
          jurisdiction: external_api_key.jurisdiction
        )
      disallowed_other_jurisdiction =
        create(
          :permit_application,
          :newly_submitted,
          jurisdiction: create(:sub_district)
        )
      disallowed_draft =
        create(:permit_application, jurisdiction: external_api_key.jurisdiction)

      # Avoid depending on Searchkick/Elasticsearch in this spec: the controller
      # filters results via Pundit policy in `apply_search_authorization`.
      allow(PermitApplication).to receive(:search).and_return(
        double(
          "PermitApplicationSearch",
          results: [allowed, disallowed_other_jurisdiction, disallowed_draft],
          total_pages: 1,
          total_count: 3,
          current_page: 1,
          limit_value: 10
        )
      )

      post "/external_api/v1/permit_applications/search",
           params: {}.to_json,
           headers: auth_headers

      expect(response).to have_http_status(:ok)
      json = JSON.parse(response.body)
      ids = (json["data"] || []).map { |row| row["id"] }

      expect(ids).to include(allowed.id)
      expect(ids).not_to include(disallowed_other_jurisdiction.id)
      expect(ids).not_to include(disallowed_draft.id)
    end

    it "returns 429 when rate limited (external_api/ip)" do
      # Avoid requiring Redis in test by using in-memory cache
      original_store = Rack::Attack.cache.store
      Rack::Attack.cache.store = ActiveSupport::Cache::MemoryStore.new
      Rack::Attack.reset!

      with_temporary_rate_limit(
        "external_api/ip",
        limit: 1,
        period: 5.minutes
      ) do
        post "/external_api/v1/permit_applications/search",
             params: {}.to_json,
             headers: auth_headers
        expect(response).to have_http_status(:ok)

        post "/external_api/v1/permit_applications/search",
             params: {}.to_json,
             headers: auth_headers
        expect(response).to have_http_status(429)

        json = JSON.parse(response.body)
        expect(json.dig("meta", "message")).to include("Rate limit exceeded")
      end
    ensure
      Rack::Attack.cache.store = original_store
      Rack::Attack.reset!
    end
  end

  describe "GET /external_api/v1/permit_applications/:id" do
    it "returns 404 for missing record" do
      get "/external_api/v1/permit_applications/#{SecureRandom.uuid}",
          headers: auth_headers
      expect(response).to have_http_status(:not_found)
    end

    it "returns 403 for record that does not satisfy policy" do
      pa =
        create(:permit_application, jurisdiction: external_api_key.jurisdiction) # draft
      get "/external_api/v1/permit_applications/#{pa.id}", headers: auth_headers
      expect(response).to have_http_status(:forbidden)
    end

    it "returns 200 for an allowed record" do
      pa =
        create(
          :permit_application,
          :newly_submitted,
          jurisdiction: external_api_key.jurisdiction
        )
      get "/external_api/v1/permit_applications/#{pa.id}", headers: auth_headers
      expect(response).to have_http_status(:ok)
    end
  end
end
