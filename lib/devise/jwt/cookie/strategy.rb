# frozen_string_literal: true

# =============================================================================
# Devise::JWT::Cookie::Strategy
# =============================================================================
#
# PROVENANCE:
#   Vendored from devise-jwt-cookie gem (https://github.com/scarhand/devise-jwt-cookie,
#   MIT license) with the following change:
#
#   DEVIATION - `aud` parameter handling:
#     The original gem hardcoded `aud = nil`. The MLH fork (devise-jwt-cookie2)
#     changed this to use `Warden::JWTAuth::EnvHelper.aud_header(env)` which
#     properly reads the audience from the request environment. This is
#     required for compatibility with warden-jwt_auth >= 0.8 which validates
#     the `aud` claim during decode.
#
# PURPOSE:
#   This is a Warden authentication strategy that reads a JWT from an httpOnly
#   cookie (instead of from the Authorization header). When a request comes in:
#
#   1. `valid?` checks if the cookie contains a token
#   2. `authenticate!` decodes the token via warden-jwt_auth's UserDecoder
#   3. If decode succeeds, the user is authenticated (success!)
#   4. If decode fails (expired, tampered, revoked), authentication fails
#
#   This strategy is registered with Warden as `:jwt_cookie` and is activated
#   on the User model via `devise :jwt_cookie_authenticatable`.
# =============================================================================

require "warden"

module Devise
  module JWT
    module Cookie
      class Strategy < Warden::Strategies::Base
        # A strategy is "valid" (worth attempting) only if a JWT cookie is
        # present in the request. If there's no cookie, Warden skips this
        # strategy and moves on to the next one in the chain.
        def valid?
          !token.nil?
        end

        # Tell Warden not to persist this authentication in the session.
        # JWT is stateless — every request re-authenticates from the cookie.
        def store?
          false
        end

        # Attempt to decode the JWT and look up the user.
        # UserDecoder.call(token, scope, aud) does:
        #   1. Decode + verify the JWT signature
        #   2. Check the token hasn't been revoked (via the Allowlist strategy)
        #   3. Look up the user by the `sub` claim
        def authenticate!
          aud = Warden::JWTAuth::EnvHelper.aud_header(env)
          user = Warden::JWTAuth::UserDecoder.new.call(token, scope, aud)
          success!(user)
        rescue ::JWT::DecodeError => e
          fail!(e.message)
        end

        private

        # Read the JWT string from the cookie. Memoized because this may be
        # called multiple times during a single request (valid? + authenticate!).
        def token
          @token ||= CookieHelper.new.read_from(cookies)
        end
      end
    end
  end
end

# Register this strategy with Warden so Devise can reference it
# via `devise :jwt_cookie_authenticatable, strategy: :jwt_cookie`.
Warden::Strategies.add(:jwt_cookie, Devise::JWT::Cookie::Strategy)
