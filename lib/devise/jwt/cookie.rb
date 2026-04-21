# frozen_string_literal: true

# =============================================================================
# Devise::JWT::Cookie — Main Entry Point
# =============================================================================
#
# PROVENANCE:
#   Vendored from devise-jwt-cookie gem (https://github.com/scarhand/devise-jwt-cookie,
#   MIT license) with the following changes:
#
#   DEVIATION - Replaced Dry::Configurable with a plain Ruby Configuration class:
#     The original gem used `extend Dry::Configurable` and `Dry::AutoInject` to
#     manage settings and inject them into CookieHelper. This pulled in three
#     transitive gems (dry-configurable, dry-container, dry-auto_inject).
#     We replaced all of that with a simple Configuration PORO (see configuration.rb).
#     The public API (`Devise.jwt_cookie { |c| c.secure = true }`) is preserved.
#
# PURPOSE:
#   This file is the single require entry point for the vendored JWT cookie
#   functionality. It:
#
#   1. Creates the Devise::JWT::Cookie module with a Configuration singleton
#   2. Adds the `Devise.jwt_cookie` class method so config/initializers/devise.rb
#      can configure cookie settings via `config.jwt_cookie do |jwt_cookie| ... end`
#   3. Registers `:jwt_cookie_authenticatable` as a Devise module, telling Devise
#      to use the `:jwt_cookie` Warden strategy when this module is included
#   4. Requires all the component files (strategy, helper, middleware, etc.)
#   5. The Railtie automatically inserts the middleware into the Rack stack
#
# HOW IT CONNECTS TO THE APP:
#   - config/initializers/devise.rb uses `config.jwt_cookie { |c| ... }`
#   - app/models/user.rb includes `:jwt_cookie_authenticatable` in its devise call
#   - app/controllers/api/sessions_controller.rb uses CookieHelper.new.build(nil)
#   - The Middleware handles cookie set/clear on every sign-in/sign-out
# =============================================================================

require_relative "cookie/configuration"
require_relative "cookie/strategy"

module Devise
  # Class-level method that provides the `config.jwt_cookie do |c| ... end`
  # block syntax in config/initializers/devise.rb. Yields the Configuration
  # instance so callers can set name, domain, secure, httponly, same_site.
  def self.jwt_cookie
    yield(Devise::JWT::Cookie.config)
  end

  # Register :jwt_cookie_authenticatable as a Devise module.
  # This tells Devise that when a model declares `devise :jwt_cookie_authenticatable`,
  # it should:
  #   1. Include the Devise::Models::JwtCookieAuthenticatable concern
  #   2. Use the :jwt_cookie Warden strategy for authentication
  add_module(:jwt_cookie_authenticatable, strategy: :jwt_cookie)

  module JWT
    module Cookie
      # Singleton Configuration instance. Created once at boot time,
      # populated by the `config.jwt_cookie` block in devise.rb.
      def self.config
        @config ||= Configuration.new
      end
    end
  end
end

require_relative "cookie/cookie_helper"
require_relative "cookie/middleware"
require_relative "cookie/railtie"
require_relative "cookie/models/jwt_cookie_authenticatable"
