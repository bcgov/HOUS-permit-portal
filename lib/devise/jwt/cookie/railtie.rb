# frozen_string_literal: true

# =============================================================================
# Devise::JWT::Cookie::Railtie
# =============================================================================
#
# PROVENANCE:
#   Vendored from devise-jwt-cookie gem (https://github.com/scarhand/devise-jwt-cookie,
#   MIT license). Logic is unchanged from the original.
#
# PURPOSE:
#   Automatically inserts the Cookie::Middleware into the Rails Rack stack
#   during boot. The middleware is placed BEFORE Warden::JWTAuth::Middleware
#   so that:
#     - On sign-out: the cookie is read and copied to the Authorization header
#       BEFORE warden-jwt_auth tries to revoke the token.
#     - On sign-in: the middleware runs AFTER the response comes back from
#       warden-jwt_auth, so it can read the newly issued token and set the cookie.
# =============================================================================

require "rails/railtie"

module Devise
  module JWT
    module Cookie
      class Railtie < Rails::Railtie
        initializer "devise-jwt-cookie-middleware" do |app|
          app.middleware.insert_before Warden::JWTAuth::Middleware,
                                       Devise::JWT::Cookie::Middleware
        end
      end
    end
  end
end
