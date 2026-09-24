require "rails_helper"

RSpec.describe "External API v2 revision reasons", type: :request do
  let(:external_api_key) { create(:external_api_key, api_version: "v2") }
  let(:site_configuration) { SiteConfiguration.instance }

  def auth_headers(key = external_api_key)
    {
      "Authorization" => "Bearer #{key.token}",
      "Content-Type" => "application/json"
    }
  end

  it "returns kept reason codes and omits discarded ones" do
    kept =
      RevisionReason.find_or_create_by!(
        reason_code: "zoning_non_compliance"
      ) do |reason|
        reason.site_configuration = site_configuration
        reason.description = "Zoning non-compliance"
      end
    discarded =
      RevisionReason.create!(
        site_configuration: site_configuration,
        reason_code: "retired_reason",
        description: "Retired"
      )
    discarded.discard!

    get "/external_api/v2/revision_reasons", headers: auth_headers

    expect(response).to have_http_status(:ok)
    rows = JSON.parse(response.body).fetch("data")
    codes = rows.map { |row| row["reason_code"] }
    expect(codes).to include(kept.reason_code)
    expect(codes).not_to include(discarded.reason_code)
    expect(rows.first.keys).to include("id", "reason_code", "description")
    expect(rows.first).not_to have_key("discarded_at")
  end

  it "rejects API keys from another contract version" do
    v1_key =
      create(
        :external_api_key,
        jurisdiction: external_api_key.jurisdiction,
        api_version: "v1"
      )

    get "/external_api/v2/revision_reasons", headers: auth_headers(v1_key)

    expect(response).to have_http_status(:forbidden)
  end
end
