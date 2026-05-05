# frozen_string_literal: true

require "rails_helper"

RSpec.describe Devise::JWT::Cookie::CookieHelper, :jwt_cookie_isolated do
  let(:helper) { described_class.new }
  let(:exp_ts) { 1_700_000_000 }
  let(:jwt_payload) { { "exp" => exp_ts } }

  before do
    decoder = instance_double(Warden::JWTAuth::TokenDecoder)
    allow(Warden::JWTAuth::TokenDecoder).to receive(:new).and_return(decoder)
    allow(decoder).to receive(:call).and_return(jwt_payload)
  end

  describe "#read_from" do
    it "reads the cookie named in config" do
      with_fresh_jwt_cookie_config do |cfg|
        cfg.name = "my_cookie"
        cookies = { "my_cookie" => "token-value" }
        expect(helper.read_from(cookies)).to eq("token-value")
      end
    end

    it "returns nil when the cookie is absent" do
      with_fresh_jwt_cookie_config { expect(helper.read_from({})).to be_nil }
    end
  end

  describe "#build" do
    context "with nil token (removal)" do
      it "returns name and options that clear the cookie" do
        with_fresh_jwt_cookie_config do |cfg|
          cfg.secure = false
          cfg.domain = nil

          name, opts = helper.build(nil)

          expect(name).to eq("access_token")
          expect(opts[:value]).to be_nil
          expect(opts[:path]).to eq("/")
          expect(opts[:httponly]).to be(true)
          expect(opts[:secure]).to be(false)
          expect(opts[:same_site]).to eq(:lax)
          expect(opts[:max_age]).to eq("0")
          expect(opts[:expires]).to eq(Time.at(0))
        end
      end

      it "excludes :domain key when config.domain is nil" do
        with_fresh_jwt_cookie_config do |cfg|
          cfg.domain = nil
          _name, opts = helper.build(nil)
          expect(opts).not_to have_key(:domain)
        end
      end

      it "includes domain when config.domain is present" do
        with_fresh_jwt_cookie_config do |cfg|
          cfg.domain = ".example.com"
          _name, opts = helper.build(nil)
          expect(opts[:domain]).to eq(".example.com")
        end
      end
    end

    context "with a token string" do
      it "decodes exp via TokenDecoder and sets cookie value and expires" do
        with_fresh_jwt_cookie_config do |cfg|
          cfg.secure = true
          token = "header.payload.sig"

          name, opts = helper.build(token)

          expect(name).to eq("access_token")
          expect(opts[:value]).to eq(token)
          expect(opts[:expires]).to eq(Time.at(exp_ts))
          expect(opts[:httponly]).to be(true)
          expect(opts[:secure]).to be(true)
          expect(opts[:same_site]).to eq(:lax)
        end
      end

      it "uses custom cookie name from config" do
        with_fresh_jwt_cookie_config do |cfg|
          cfg.name = "custom_jwt"
          token = "header.payload.sig"

          name, opts = helper.build(token)

          expect(name).to eq("custom_jwt")
          expect(opts[:value]).to eq(token)
        end
      end
    end
  end
end
