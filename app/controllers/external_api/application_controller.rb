class ExternalApi::ApplicationController < ActionController::API
  include ActionController::HttpAuthentication::Token::ControllerMethods
  include BaseControllerMethods
  include Pundit::Authorization

  before_action :authenticate_with_token
  before_action :store_currents

  attr_reader :current_external_api_key

  rescue_from Pundit::NotAuthorizedError, with: :external_api_key_not_authorized

  # skip because this is API only controller, not connecting to any SPA
  skip_forgery_protection

  def pundit_user
    current_external_api_key
  end

  protected

  def apply_search_authorization(results, policy_action = action_name)
    results.select do |result|
      policy([:external_api, result]).send("#{policy_action}?".to_sym)
    end
  end

  def store_currents
    Current.external_api_key = current_external_api_key
  end

  def external_api_key_not_authorized(exception)
    render_error(
      "misc.external_api_key_unauthorized_error",
      { message_opts: { error_message: exception.message }, status: 403 },
      exception
    ) and return
  end

  def authenticate_with_token
    authenticate_or_request_with_http_token do |token, options|
      @current_external_api_key = ExternalApiKey.active.find_by_token(token)
    end
  end

  def current_sandbox
    current_external_api_key.sandbox
  end

  # Override rails default 401 response to return JSON content-type
  # with request for Bearer token
  # https://api.rubyonrails.org/classes/ActionController/HttpAuthentication/Token/ControllerMethods.html
  def request_http_token_authentication(realm = "Extern api", message = nil)
    headers["WWW-Authenticate"] = %(Bearer realm="#{realm.tr('"', "")}")

    render_error(
      "misc.external_api_key_forbidden_error",
      {
        message_opts: {
          error_message: message || "Access denied"
        },
        status: 401
      }
    ) and return
  end
end
