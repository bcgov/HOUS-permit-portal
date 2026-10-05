class ExternalApi::ApplicationController < ActionController::API
  include ActionController::HttpAuthentication::Token::ControllerMethods
  include BaseControllerMethods
  include Pundit::Authorization

  before_action :authenticate_with_token
  before_action :authorize_api_version
  before_action :store_currents

  attr_reader :current_external_api_key

  rescue_from ActiveRecord::RecordNotFound do |exception|
    # You might want to customize the error key based on the model
    # e.g., extract model name from exception.message
    render_error "misc.not_found_error", { status: :not_found }, exception # Pass exception for logging
  end

  rescue_from Pundit::NotAuthorizedError, with: :external_api_key_not_authorized

  # skip because this is API only controller, not connecting to any SPA
  skip_forgery_protection

  def pundit_user
    current_external_api_key
  end

  protected

  def store_currents
    Current.external_api_key = current_external_api_key
  end

  def external_api_key_not_authorized(exception)
    render_error(
      "misc.external_api_key_unauthorized_error",
      { status: 403, log_args: { errors: exception.message } }
    ) and return
  end

  def authenticate_with_token
    authenticate_or_request_with_http_token do |token, options|
      @current_external_api_key = ExternalApiKey.active.find_by_token(token)
    end
  end

  def authorize_api_version
    return if current_external_api_key.api_version == expected_api_version

    raise Pundit::NotAuthorizedError,
          "This API key is for #{current_external_api_key.api_version}, not #{expected_api_version}."
  end

  def expected_api_version
    raise NotImplementedError, "#{self.class} must define expected_api_version"
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

  def page_meta(search_results)
    {
      total_pages: search_results.total_pages,
      total_count: search_results.total_count,
      current_page: search_results.current_page,
      per_page: search_results.limit_value
    }
  end
end
