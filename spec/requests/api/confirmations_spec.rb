require "rails_helper"

RSpec.describe "Api::Confirmations", type: :request do
  before do
    allow(PermitHubMailer).to receive(:welcome).and_return(
      double(deliver_later: true)
    )
  end

  def confirmation_token_for(user)
    raw_token, enc_token =
      Devise.token_generator.generate(User, :confirmation_token)
    user.update!(
      confirmation_token: enc_token,
      confirmation_sent_at: Time.current
    )
    raw_token
  end

  describe "GET /api/confirmation" do
    it "redirects to confirmed url on success" do
      user = create(:user, confirmed: false)
      token = confirmation_token_for(user)

      get "/api/confirmation", params: { confirmation_token: token }

      expect(response).to have_http_status(:found)
      expect(response.headers["Location"]).to start_with(confirmed_url)
    end

    it "redirects to root url on invalid token" do
      get "/api/confirmation", params: { confirmation_token: "invalid-token" }

      expect(response).to have_http_status(:found)
      expect(response.headers["Location"]).to start_with(root_url)
    end
  end
end
