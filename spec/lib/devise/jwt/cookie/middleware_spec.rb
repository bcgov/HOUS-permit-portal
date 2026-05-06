# frozen_string_literal: true

require "rails_helper"

RSpec.describe Devise::JWT::Cookie::Middleware, :jwt_cookie_isolated do
  let(:revocation_requests) { [["DELETE", %r{^/api/logout$}]] }
  # warden-jwt_auth does not expose a public Config class constant; Middleware only
  # calls #revocation_requests on the object returned by Warden::JWTAuth.config.
  let(:jwt_auth_config) { double(revocation_requests: revocation_requests) }

  let(:inner_app) do
    lambda { |_env| [200, { "Content-Type" => "text/plain" }, ["OK"]] }
  end

  before do
    allow(Warden::JWTAuth).to receive(:config).and_return(jwt_auth_config)
  end

  describe "#call" do
    context "when request matches a revocation route" do
      let(:env) do
        Rack::MockRequest.env_for(
          "/api/logout",
          :method => "DELETE",
          "HTTP_COOKIE" => "access_token=revoke-me"
        )
      end

      it "copies the cookie token into HTTP_AUTHORIZATION before calling the app" do
        received = nil
        app =
          lambda do |e|
            received = e["HTTP_AUTHORIZATION"]
            [200, {}, []]
          end

        described_class.new(app).call(env)

        expect(received).to eq("Bearer revoke-me")
      end

      it "appends a removal Set-Cookie (empty value, max-age=0)" do
        _status, headers, _body = described_class.new(inner_app).call(env.dup)

        set_cookie = headers[Rack::SET_COOKIE]
        expect(set_cookie).to be_present
        expect(set_cookie).to include("access_token=;")
        expect(set_cookie).to include("max-age=0")
      end
    end

    context "when revocation route is hit but no cookie is present" do
      let(:env) { Rack::MockRequest.env_for("/api/logout", method: "DELETE") }

      it "sets HTTP_AUTHORIZATION with an empty Bearer token" do
        received = nil
        app =
          lambda do |e|
            received = e["HTTP_AUTHORIZATION"]
            [200, {}, []]
          end

        described_class.new(app).call(env)

        expect(received).to eq("Bearer ")
      end
    end

    context "when response has Authorization header and warden-jwt_auth.token in env" do
      let(:new_token) { "new.jwt.value" }
      let(:inner_with_dispatch) do
        lambda do |env|
          env[described_class::ENV_KEY] = new_token
          # warden-jwt_auth's HeaderParser.to_headers always writes mixed-case
          # "Authorization" (from config.token_header, default: 'Authorization').
          [200, { "Authorization" => "Bearer #{new_token}" }, ["OK"]]
        end
      end

      # CookieHelper#build(token) decodes the JWT for exp; real TokenDecoder reads
      # Warden::JWTAuth.config (secret, etc.). Our jwt_auth_config double only stubs
      # revocation_requests, so stub the decoder for this path.
      before do
        decoder = instance_double(Warden::JWTAuth::TokenDecoder)
        allow(Warden::JWTAuth::TokenDecoder).to receive(:new).and_return(
          decoder
        )
        allow(decoder).to receive(:call).and_return({ "exp" => 1_700_000_000 })
      end

      it "sets a secure httpOnly Set-Cookie with the issued token" do
        env = Rack::MockRequest.env_for("/api/login", method: "POST")
        _status, headers, _body =
          described_class.new(inner_with_dispatch).call(env)

        set_cookie = headers[Rack::SET_COOKIE]
        expect(set_cookie).to be_present
        expect(set_cookie).to include("access_token=#{new_token}")
        expect(set_cookie).to include("httponly")
      end
    end

    context "when path matches revocation but method does not" do
      it "does not set HTTP_AUTHORIZATION or clear the cookie" do
        env = Rack::MockRequest.env_for("/api/logout", method: "GET")
        _status, headers, _body = described_class.new(inner_app).call(env)

        expect(env["HTTP_AUTHORIZATION"]).to be_nil
        expect(headers[Rack::SET_COOKIE]).to be_nil
      end
    end

    context "when request is not revocation and no dispatch token" do
      it "does not mutate Authorization or add Set-Cookie" do
        env = Rack::MockRequest.env_for("/api/other", method: "GET")
        _status, headers, _body = described_class.new(inner_app).call(env)

        expect(env["HTTP_AUTHORIZATION"]).to be_nil
        expect(headers[Rack::SET_COOKIE]).to be_nil
      end
    end
  end
end
