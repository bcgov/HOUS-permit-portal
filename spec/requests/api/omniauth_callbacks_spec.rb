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
    let(:token_encoder) do
      instance_double(Warden::JWTAuth::TokenEncoder, call: "stub-token")
    end
    let(:user_decoder) do
      instance_double(Warden::JWTAuth::UserDecoder, call: user)
    end

    before do
      allow(Warden::JWTAuth::TokenEncoder).to receive(:new).and_return(
        token_encoder
      )
      allow(Warden::JWTAuth::UserDecoder).to receive(:new).and_return(
        user_decoder
      )
      allow_any_instance_of(User).to receive(:on_jwt_dispatch)
      allow(JWT).to receive(:decode).and_return([{}, {}])
    end

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
    end
  end

  describe "GET /api/auth/failure" do
    it "redirects to login with error flash" do
      get "/api/auth/failure"

      expect(response).to have_http_status(:ok)
    end
  end
end
