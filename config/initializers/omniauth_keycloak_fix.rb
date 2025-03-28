# frozen_string_literal: true

# This is a temporary fix to ensure the 'openid' scope is included in the authorization request
if defined?(OmniAuth::Strategies::KeycloakOpenId)
  module OmniAuth
    module Strategies
      class KeycloakOpenId
        # Override the authorize_params method to ensure 'openid' is in the scope
        alias_method :original_authorize_params, :authorize_params

        def authorize_params
          params = original_authorize_params

          # Ensure openid is in the scope
          scope_list = (params["scope"] || "").split(" ")
          scope_list << "openid" unless scope_list.include?("openid")
          params["scope"] = scope_list.join(" ")

          # Log the params for debugging
          # Rails.logger.info "Keycloak authorize params: #{params.inspect}"
          # Rails.logger.info "Original authorize params: #{original_authorize_params.inspect}"

          params
        end
      end
    end
  end
end
