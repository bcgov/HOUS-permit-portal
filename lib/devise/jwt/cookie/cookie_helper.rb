# frozen_string_literal: true

# =============================================================================
# Devise::JWT::Cookie::CookieHelper
# =============================================================================
#
# PROVENANCE:
#   Vendored from devise-jwt-cookie gem (https://github.com/scarhand/devise-jwt-cookie,
#   MIT license) with the following changes:
#
#   DEVIATION 1 - Removed Dry::AutoInject dependency:
#     Original used `include Cookie::Import['name', 'domain', 'secure']` to
#     inject config values via Dry::AutoInject. We now read directly from
#     `Devise::JWT::Cookie.config` instead.
#
#   DEVIATION 2 - Added httponly + same_site config:
#     Taken from the MLH fork (devise-jwt-cookie2). The original hardcoded
#     httponly: true and had no same_site support. We now read both from config.
#
# PURPOSE:
#   Builds and removes the httpOnly cookie that carries the JWT token.
#   Used in two places in this app:
#
#   1. The Middleware (middleware.rb) calls `build(token)` to set the cookie
#      on responses where a JWT was issued, and `build(nil)` to clear the
#      cookie on sign-out.
#
#   2. The SessionsController calls `CookieHelper.new.build(nil)` directly
#      to clear a stale cookie when token validation fails
#      (see app/controllers/api/sessions_controller.rb, validate_token action).
#
#   3. The Strategy (strategy.rb) calls `read_from(cookies)` to extract the
#      JWT from the incoming request cookies for Warden authentication.
# =============================================================================

module Devise
  module JWT
    module Cookie
      class CookieHelper
        # Build a cookie tuple [name, options_hash] for the given JWT token.
        # Pass nil to build a removal cookie (expires immediately).
        #
        # Returns: [String, Hash] — the cookie name and its Rack-compatible options.
        # This tuple is consumed by Rack::Utils.set_cookie_header!
        def build(token)
          token.nil? ? remove_cookie : create_cookie(token)
        end

        # Read the JWT token string from a cookies hash (ActionDispatch or Rack).
        # Returns the raw JWT string, or nil if the cookie is not present.
        def read_from(cookies)
          cookies[config.name]
        end

        private

        # Convenience accessor — all settings come from the Configuration PORO
        # that is populated via `config.jwt_cookie { |c| ... }` in devise.rb.
        def config
          Devise::JWT::Cookie.config
        end

        # Build the cookie for a valid JWT token.
        # Decodes the token to extract its `exp` claim so the cookie expiry
        # matches the JWT expiry exactly.
        def create_cookie(token)
          jwt = Warden::JWTAuth::TokenDecoder.new.call(token)
          [
            config.name,
            {
              value: token,
              **global_options,
              expires: Time.at(jwt["exp"].to_i)
            }
          ]
        end

        # Build a removal cookie — zero max_age and epoch expiry tell the browser
        # to delete the cookie immediately.
        def remove_cookie
          [
            config.name,
            { value: nil, **global_options, max_age: "0", expires: Time.at(0) }
          ]
        end

        # Shared cookie options used by both create and remove.
        # These map directly to Rack::Utils.set_cookie_header! options.
        def global_options
          opts = {
            path: "/",
            httponly: config.httponly,
            secure: config.secure,
            same_site: config.same_site
          }
          opts[:domain] = config.domain if config.domain.present?
          opts
        end
      end
    end
  end
end
