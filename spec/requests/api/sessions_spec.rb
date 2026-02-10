require "rails_helper"

RSpec.describe "Api::Sessions", type: :request do
  let(:password) { "P@ssword1" }
  let(:user) { create(:user, password: password) }

  def login_as(user, password: user.password)
    post "/api/login",
         params: {
           user: {
             email: user.email,
             password: password
           }
         }
  end

  def cookie_header_from_response
    { "Cookie" => Array(response.headers["Set-Cookie"]).join("; ") }
  end

  def expired_jwt_for(user)
    jti = SecureRandom.uuid
    exp = 1.hour.ago.to_i
    payload = {
      "sub" => user.id,
      "scp" => "user",
      "aud" => nil,
      "jti" => jti,
      "exp" => exp
    }

    AllowlistedJwt.create!(user_id: user.id, jti: jti, exp: Time.at(exp))
    Warden::JWTAuth::TokenEncoder.new.call(payload)
  end

  describe "POST /api/login" do
    it "sets session and csrf cookies on success" do
      login_as(user)

      expect(response).to have_http_status(:created)
      set_cookie = response.headers["Set-Cookie"]
      expect(set_cookie.join("; ")).to include("access_token=")
      expect(set_cookie.join("; ")).to include("CSRF-TOKEN=")
    end

    it "returns unauthorized on invalid credentials" do
      login_as(user, password: "wrong-password")

      expect(response).to have_http_status(:unauthorized)
    end
  end

  describe "GET /api/validate_token" do
    let(:token_encoder) do
      instance_double(Warden::JWTAuth::TokenEncoder, call: "stub-token")
    end

    before do
      allow(Warden::JWTAuth::TokenEncoder).to receive(:new).and_return(
        token_encoder
      )
      allow_any_instance_of(User).to receive(:on_jwt_dispatch)
      allow(JWT).to receive(:decode).and_return([{}, {}])
      EndUserLicenseAgreement.create!(
        variant: user.eula_variant,
        active: true,
        content: "<p>Test EULA</p>"
      )
    end

    it "returns unauthorized without authentication" do
      get "/api/validate_token"

      expect(response).to have_http_status(:unauthorized)
    end

    it "returns current user when authenticated" do
      login_as(user)

      get "/api/validate_token", headers: cookie_header_from_response

      expect(JWT).to have_received(:decode)
      expect(response).to have_http_status(:ok)
      expect(json_response.dig("data", "id")).to eq(user.id)
    end

    it "returns unauthorized for an expired token" do
      token = expired_jwt_for(user)

      get "/api/validate_token",
          headers: {
            "Cookie" => "access_token=#{token}"
          }

      expect(response).to have_http_status(:unauthorized)
    end
  end

  describe "GET /api/logout" do
    before do
      allow(ENV).to receive(:[]).and_call_original
      allow(ENV).to receive(:[]).with("KEYCLOAK_LOGOUT_URL").and_return(
        "https://logout.example.com"
      )
      allow(ENV).to receive(:[]).with("POST_LOGOUT_REDIRECT_URL").and_return(
        "https://app.example.com"
      )
    end

    it "returns a logout redirect url when id_token is present" do
      get "/api/logout", headers: { "Cookie" => "id_token=sample-token" }

      expect(response).to have_http_status(:ok)
      expect(json_response.dig("logout_url")).to include(
        "https://logout.example.com"
      )
      expect(
        response.headers["Set-Cookie"].any? do |cookie|
          cookie.include?("id_token=")
        end
      ).to be(true)
    end
  end
end
