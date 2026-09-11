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

    def stub_permit_application_search(*records)
      allow(PermitApplication).to receive(:search) do |_query, **kwargs|
        relation = PermitApplication.where(id: records.map(&:id))
        scoped = kwargs.fetch(:scope_results).call(relation)
        results = scoped.to_a

        double(
          "PermitApplicationSearch",
          results: results,
          total_pages: 1,
          total_count: results.size,
          current_page: 1,
          limit_value: 10
        )
      end
    end

    def search_ids
      JSON.parse(response.body).fetch("data").map { |row| row["id"] }
    end

    it "returns results scoped by policy (jurisdiction + submitted + sandbox)" do
      allowed =
        create(
          :permit_application,
          :newly_submitted,
          jurisdiction: external_api_key.jurisdiction
        )
      allowed_in_review =
        create(
          :permit_application,
          jurisdiction: external_api_key.jurisdiction,
          status: :in_review
        )
      disallowed_other_jurisdiction =
        create(
          :permit_application,
          :newly_submitted,
          jurisdiction: create(:sub_district)
        )
      disallowed_draft =
        create(:permit_application, jurisdiction: external_api_key.jurisdiction)
      disallowed_revisions =
        create(
          :permit_application,
          :revisions_requested,
          jurisdiction: external_api_key.jurisdiction
        )
      disallowed_sandbox =
        create(
          :permit_application,
          :newly_submitted,
          jurisdiction: external_api_key.jurisdiction,
          sandbox: external_api_key.jurisdiction.sandboxes.published.first
        )

      stub_permit_application_search(
        allowed,
        allowed_in_review,
        disallowed_other_jurisdiction,
        disallowed_draft,
        disallowed_revisions,
        disallowed_sandbox
      )

      post "/external_api/v1/permit_applications/search",
           params: {}.to_json,
           headers: auth_headers

      expect(response).to have_http_status(:ok)
      expect(search_ids).to contain_exactly(allowed.id, allowed_in_review.id)
    end

    it "returns only the sandbox key's submitted applications" do
      sandbox = external_api_key.jurisdiction.sandboxes.published.first
      sandbox_key =
        create(
          :external_api_key,
          jurisdiction: external_api_key.jurisdiction,
          sandbox:
        )
      allowed =
        create(
          :permit_application,
          :newly_submitted,
          jurisdiction: sandbox_key.jurisdiction,
          sandbox:
        )
      live =
        create(
          :permit_application,
          :newly_submitted,
          jurisdiction: sandbox_key.jurisdiction
        )
      other_sandbox =
        create(
          :permit_application,
          :newly_submitted,
          jurisdiction: sandbox_key.jurisdiction,
          sandbox: sandbox_key.jurisdiction.sandboxes.scheduled.first
        )

      stub_permit_application_search(allowed, live, other_sandbox)

      post "/external_api/v1/permit_applications/search",
           params: {}.to_json,
           headers: auth_headers(token: sandbox_key.token)

      expect(response).to have_http_status(:ok)
      expect(search_ids).to contain_exactly(allowed.id)
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

  describe "PATCH /external_api/v1/permit_applications/:id/status" do
    it "does not expose status write-back in V1" do
      patch "/external_api/v1/permit_applications/#{SecureRandom.uuid}/status",
            params: { status: "in_review" }.to_json,
            headers: auth_headers

      expect(response).to have_http_status(:not_found)
    end
  end
end
