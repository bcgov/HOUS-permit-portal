# frozen_string_literal: true

require "rails_helper"

RSpec.describe Devise::JWT::Cookie::Strategy, :jwt_cookie_isolated do
  let(:token) { "header.payload.sig" }
  let(:env) do
    Rack::MockRequest.env_for("/", "HTTP_COOKIE" => "access_token=#{token}")
  end

  subject(:strategy) { described_class.new(env, :user) }

  describe "#valid?" do
    it "is true when the access_token cookie is present" do
      expect(strategy).to be_valid
    end

    it "is false when the cookie is absent" do
      empty = Rack::MockRequest.env_for("/")
      expect(described_class.new(empty, :user)).not_to be_valid
    end
  end

  describe "#store?" do
    it "is false (JWT is stateless, not stored in session)" do
      expect(strategy.store?).to be(false)
    end
  end

  describe "#authenticate!" do
    let(:user) { instance_double(User, id: "user-uuid") }
    let(:decoder) { instance_double(Warden::JWTAuth::UserDecoder) }

    before do
      allow(Warden::JWTAuth::EnvHelper).to receive(:aud_header).with(
        env
      ).and_return("test-aud")
      allow(Warden::JWTAuth::UserDecoder).to receive(:new).and_return(decoder)
      allow(decoder).to receive(:call).with(
        token,
        :user,
        "test-aud"
      ).and_return(user)
    end

    it "calls UserDecoder with token, scope, and aud from EnvHelper" do
      expect(decoder).to receive(:call).with(
        token,
        :user,
        "test-aud"
      ).and_return(user)
      strategy._run!
      expect(strategy.user).to eq(user)
    end

    context "when JWT::DecodeError is raised" do
      before do
        allow(decoder).to receive(:call).and_raise(
          JWT::DecodeError,
          "bad token"
        )
      end

      it "fails the strategy with the decode error message" do
        strategy._run!
        expect(strategy).not_to be_successful
        expect(strategy.message).to eq("bad token")
      end
    end
  end
end
