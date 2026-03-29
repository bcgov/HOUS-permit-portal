# frozen_string_literal: true

# =============================================================================
# Devise::JWT::Cookie::Configuration
# =============================================================================
#
# PROVENANCE:
#   Vendored replacement for the Dry::Configurable module that was used in the
#   original devise-jwt-cookie gem (https://github.com/scarhand/devise-jwt-cookie).
#   The original gem used Dry::Configurable + Dry::AutoInject to manage these
#   settings, which pulled in heavy transitive dependencies (dry-container,
#   dry-configurable, dry-auto_inject). This plain Ruby class replaces all of
#   that with zero external dependencies.
#
# PURPOSE:
#   Holds the cookie configuration values that are set via Devise.setup in
#   config/initializers/devise.rb using the `config.jwt_cookie` block:
#
#     config.jwt_cookie do |jwt_cookie|
#       jwt_cookie.domain = ".example.com"
#       jwt_cookie.secure = true
#     end
#
# DEFAULTS:
#   These match the original gem's defaults. The cookie name "access_token"
#   is what the frontend reads via withCredentials and what ApplicationCable
#   uses to decode the JWT for WebSocket connections.
# =============================================================================

module Devise
  module JWT
    module Cookie
      class Configuration
        # The name of the httpOnly cookie that stores the JWT.
        # Default: "access_token" -- this is what the browser sends with
        # every API request and what ApplicationCable::Connection reads
        # from cookies["access_token"].
        attr_accessor :name

        # Whether the cookie should have the Secure flag (only sent over HTTPS).
        # Should be true in production, false in local development.
        attr_accessor :secure

        # The Domain attribute for the cookie. When set (e.g. ".example.com"),
        # the cookie is available to all subdomains. When nil, the cookie is
        # scoped to the exact host.
        attr_accessor :domain

        # Whether the cookie should have the HttpOnly flag (not accessible to
        # JavaScript). Should almost always be true for security.
        attr_accessor :httponly

        # The SameSite attribute for the cookie. Controls cross-site request
        # behavior. Common values: :strict, :lax, :none.
        attr_accessor :same_site

        def initialize
          @name = "access_token"
          @secure = true
          @domain = nil
          @httponly = true
          @same_site = :lax
        end
      end
    end
  end
end
