# frozen_string_literal: true

# =============================================================================
# Devise::JWT::Cookie::Middleware
# =============================================================================
#
# PROVENANCE:
#   Vendored from devise-jwt-cookie gem (https://github.com/scarhand/devise-jwt-cookie,
#   MIT license). Logic is unchanged from the original.
#
# PURPOSE:
#   This Rack middleware is the bridge between cookie-based JWT auth and the
#   devise-jwt / warden-jwt_auth gems (which expect the JWT in the
#   Authorization header).
#
#   It handles two directions:
#
#   INBOUND (request) — Token revocation on sign-out:
#     When the request matches a revocation route (e.g. DELETE /api/logout),
#     the middleware reads the JWT from the cookie and copies it into the
#     `HTTP_AUTHORIZATION` header so that devise-jwt's revocation logic
#     can find and revoke it (remove from the allowlisted_jwts table).
#
#   OUTBOUND (response) — Cookie creation on sign-in:
#     After the app processes a dispatch request (e.g. POST /api/login),
#     devise-jwt puts the new JWT in both the Authorization header and the
#     `warden-jwt_auth.token` env key. This middleware reads that token and
#     sets it as an httpOnly cookie in the response headers.
#
#   OUTBOUND (response) — Cookie removal on sign-out:
#     After revocation, the middleware sets a removal cookie (expires: epoch 0)
#     to clear the JWT cookie from the browser.
#
# POSITIONING:
#   The Railtie (railtie.rb) inserts this middleware BEFORE
#   Warden::JWTAuth::Middleware in the Rack stack. This ordering is critical:
#   the cookie-to-header copy must happen before warden-jwt_auth processes
#   the request for revocation.
# =============================================================================

module Devise
  module JWT
    module Cookie
      class Middleware
        # This is the Rack env key where warden-jwt_auth stores the newly
        # issued JWT token after a successful dispatch (sign-in).
        ENV_KEY = "warden-jwt_auth.token"

        attr_reader :app, :config

        def initialize(app)
          @app = app
          @config = Warden::JWTAuth.config
        end

        def call(env)
          # BEFORE the request reaches the app: if this is a sign-out request,
          # copy the JWT from the cookie into the Authorization header so
          # devise-jwt can revoke it from the allowlisted_jwts table.
          token_should_be_revoked = token_should_be_revoked?(env)
          if token_should_be_revoked
            request = ActionDispatch::Request.new(env)
            env[
              "HTTP_AUTHORIZATION"
            ] = "Bearer #{CookieHelper.new.read_from(request.cookies)}"
          end

          # Let the rest of the Rack stack (including Warden + the app) run.
          status, headers, response = app.call(env)

          # AFTER the response comes back:
          if headers["Authorization"] && env[ENV_KEY]
            # A new JWT was issued (sign-in / dispatch) — set it as a cookie.
            name, cookie = CookieHelper.new.build(env[ENV_KEY])
            Rack::Utils.set_cookie_header!(headers, name, cookie)
          elsif token_should_be_revoked
            # Sign-out — clear the cookie from the browser.
            name, cookie = CookieHelper.new.build(nil)
            Rack::Utils.set_cookie_header!(headers, name, cookie)
          end

          [status, headers, response]
        end

        private

        # Check if the current request matches any of the configured revocation
        # routes (defined by warden-jwt_auth). These are typically sign-out
        # endpoints like ["DELETE", /^\/api\/logout$/].
        def token_should_be_revoked?(env)
          path_info = env["PATH_INFO"] || ""
          method = env["REQUEST_METHOD"]
          revocation_requests = config.revocation_requests
          revocation_requests.each do |tuple|
            revocation_method, revocation_path = tuple
            if path_info.match(revocation_path) && method == revocation_method
              return true
            end
          end
          false
        end
      end
    end
  end
end
