require "rails_helper"

RSpec.describe ApplicationCable::Connection, type: :channel do
  let(:user) { create(:user) }

  it "authenticates using the configured cookie alongside another environment's cookie" do
    with_auth_cookie_prefix("hub_test_") do
      token, payload = Warden::JWTAuth::UserEncoder.new.call(user, :user, nil)
      user.on_jwt_dispatch(token, payload)
      cookies["access_token"] = "foreign-environment-token"
      cookies["hub_test_access_token"] = token

      connect "/cable"

      expect(connection.current_user).to eq(user)
    end
  end

  it "keeps authenticating existing production cookies with an empty prefix" do
    with_auth_cookie_prefix("") do
      token, payload = Warden::JWTAuth::UserEncoder.new.call(user, :user, nil)
      user.on_jwt_dispatch(token, payload)
      cookies["access_token"] = token

      connect "/cable"

      expect(connection.current_user).to eq(user)
    end
  end
end
