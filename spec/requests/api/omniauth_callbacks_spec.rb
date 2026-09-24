require "rails_helper"

RSpec.describe "Api::OmniauthCallbacks", type: :request do
  let(:user) { create(:user) }

  before { OmniAuth.config.test_mode = true }

  after do
    OmniAuth.config.test_mode = false
    OmniAuth.config.mock_auth[:keycloak] = nil
  end

  def mock_auth_hash(idp_hint:)
    OmniAuth::AuthHash.new(
      provider: "keycloak",
      uid: SecureRandom.uuid,
      info: {
        email: user.email
      },
      extra: {
        id_token: "id-token-#{idp_hint}",
        raw_info: {
          idp: idp_hint
        }
      }
    )
  end

  def set_origin(invitation_token: nil)
    query =
      invitation_token.present? ? "?invitation_token=#{invitation_token}" : ""
    "https://app.example.com#{query}"
  end

  def stub_resolver_for(invitation_token:, result_user:)
    result = Struct.new(:user, :error_key).new(result_user, "omniauth.failure")
    resolver = instance_double(OmniauthUserResolver, call: result)
    expect(OmniauthUserResolver).to receive(:new).with(
      hash_including(
        invitation_token: invitation_token,
        auth: kind_of(OmniAuth::AuthHash)
      )
    ).and_return(resolver)
  end

  describe "GET /api/auth/keycloak/callback" do
    before { stub_jwt_auth(user: user) }

    it "handles BCeID callback success" do
      OmniAuth.config.mock_auth[:keycloak] = mock_auth_hash(idp_hint: "bceid")
      stub_resolver_for(invitation_token: "invite-token", result_user: user)
      allow(JWT).to receive(:decode).and_return([{}, {}])

      get "/api/auth/keycloak/callback",
          env: {
            "omniauth.auth" => OmniAuth.config.mock_auth[:keycloak],
            "omniauth.origin" => set_origin(invitation_token: "invite-token")
          }

      expect(JWT).to have_received(:decode)
      expect(response).to have_http_status(:found)
      expect(response.headers["Location"]).to eq(root_url)
      set_cookie = response.headers["Set-Cookie"]
      expect(set_cookie.join("; ")).to include("access_token=")
    end

    it "handles IDIR callback success" do
      OmniAuth.config.mock_auth[:keycloak] = mock_auth_hash(idp_hint: "idir")
      stub_resolver_for(invitation_token: nil, result_user: user)

      get "/api/auth/keycloak/callback",
          env: {
            "omniauth.auth" => OmniAuth.config.mock_auth[:keycloak],
            "omniauth.origin" => set_origin
          }

      expect(response).to have_http_status(:found)
      expect(response.headers["Location"]).to eq(root_url)
    end

    it "redirects to login on failure from resolver" do
      OmniAuth.config.mock_auth[:keycloak] = mock_auth_hash(idp_hint: "bceid")
      invalid_user = User.new(email: nil)
      invalid_user.valid?
      stub_resolver_for(invitation_token: nil, result_user: invalid_user)

      get "/api/auth/keycloak/callback",
          env: {
            "omniauth.auth" => OmniAuth.config.mock_auth[:keycloak],
            "omniauth.origin" => set_origin
          }

      expect(response).to have_http_status(:found)
      expect(response.headers["Location"]).to include(login_path)
      expect(login_reason_from(response.headers["Location"])).to eq("denied")
    end
  end

  describe "GET /api/auth/failure" do
    it "redirects to login with cancelled when the IdP denies access" do
      get "/api/auth/failure", params: { message: "access_denied" }

      expect(response).to have_http_status(:found)
      expect(response.headers["Location"]).to include(login_path)
      expect(login_reason_from(response.headers["Location"])).to eq("cancelled")
    end

    it "redirects to login with error when the login service is unavailable" do
      get "/api/auth/failure", params: { message: "service_unavailable" }

      expect(response).to have_http_status(:found)
      expect(login_reason_from(response.headers["Location"])).to eq("error")
    end

    it "uses unknown for unrecognized messages and does not copy raw IdP text into loginReason" do
      raw = "invalid_client: secret leaked from keycloak"
      get "/api/auth/failure", params: { message: raw }

      expect(response).to have_http_status(:found)
      expect(login_reason_from(response.headers["Location"])).to eq("unknown")
      expect(Rack::Utils.unescape(response.headers["Location"])).not_to include(
        "secret leaked"
      )
    end
  end

  def login_reason_from(location)
    Rack::Utils.parse_query(URI(location).query)["loginReason"]
  end
end
