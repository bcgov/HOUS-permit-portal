require "rails_helper"

RSpec.describe "Cookie-authenticated API CSRF protection", type: :request do
  let(:user) { create(:user) }

  around do |example|
    original = ActionController::Base.allow_forgery_protection
    original_api = Api::ApplicationController.allow_forgery_protection
    original_auth = ENV["ENABLE_LOCAL_PASSWORD_AUTH"]
    ENV["ENABLE_LOCAL_PASSWORD_AUTH"] = "true"
    example.run
  ensure
    ActionController::Base.allow_forgery_protection = original
    Api::ApplicationController.allow_forgery_protection = original_api
    ENV["ENABLE_LOCAL_PASSWORD_AUTH"] = original_auth
  end

  before do
    https!
    allow_any_instance_of(Api::ApplicationController).to receive(
      :verify_authenticity_token
    ).and_call_original
    allow(NotificationService).to receive(:reset_user_feed_last_read)

    # Establish a real JWT cookie, then exercise CSRF with protection enabled.
    post "/api/login",
         params: {
           user: {
             email: user.email,
             password: user.password
           }
         }
    expect(response).to have_http_status(:created)
    expect(cookies[AuthCookies.access_token_name]).to be_present
    @csrf_token = cookies["CSRF-TOKEN"]
    ActionController::Base.allow_forgery_protection = true
    Api::ApplicationController.allow_forgery_protection = true
  end

  it "accepts the authenticated user's CSRF token" do
    post "/api/notifications/reset_last_read",
         headers: {
           "X-CSRF-Token" => @csrf_token
         }

    expect(response).to have_http_status(:ok)
    expect(NotificationService).to have_received(
      :reset_user_feed_last_read
    ).with(user.id)
  end

  [nil, "invalid-token"].each do |token|
    it "rejects a #{token ? "forged" : "missing"} CSRF token before changing the feed" do
      headers = token ? { "X-CSRF-Token" => token } : {}
      post "/api/notifications/reset_last_read", headers: headers

      expect(response).to have_http_status(422)
      expect(NotificationService).not_to have_received(
        :reset_user_feed_last_read
      )
    end
  end
end
