# frozen_string_literal: true

# =============================================================================
# Devise::Models::JwtCookieAuthenticatable
# =============================================================================
#
# PROVENANCE:
#   Vendored from devise-jwt-cookie gem (https://github.com/scarhand/devise-jwt-cookie,
#   MIT license). Logic is unchanged from the original.
#
# PURPOSE:
#   This Devise model concern is included in the User model when you add
#   `:jwt_cookie_authenticatable` to the devise declaration. It provides
#   two methods that the JWT authentication pipeline needs:
#
#   1. `find_for_jwt_authentication(sub)` — class method used by
#      warden-jwt_auth's UserDecoder to look up the user by the JWT's
#      `sub` (subject) claim. Returns the user record.
#
#   2. `jwt_subject` — instance method that returns the value to encode
#      as the `sub` claim when issuing a new JWT. Defaults to the
#      primary key (id).
#
#   These methods are identical to what devise-jwt itself provides in
#   its :jwt_authenticatable module. The cookie variant exists so both
#   strategies (header-based and cookie-based) can coexist on the same model.
# =============================================================================

require "active_support/concern"

module Devise
  module Models
    module JwtCookieAuthenticatable
      extend ActiveSupport::Concern

      included do
        def self.find_for_jwt_authentication(sub)
          find_by(primary_key => sub)
        end
      end

      def jwt_subject
        id
      end
    end
  end
end
