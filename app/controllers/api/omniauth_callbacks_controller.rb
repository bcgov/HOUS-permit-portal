class Api::OmniauthCallbacksController < Devise::OmniauthCallbacksController
  include BaseControllerMethods

  SERVICE_UNAVAILABLE_FAILURE_TYPES = %w[
    service_unavailable
    temporarily_unavailable
  ].freeze
  LOGIN_FAIL_REASONS = %w[denied error cancelled unknown].freeze

  def keycloak
    origin_query =
      Rack::Utils.parse_nested_query(URI(request.env["omniauth.origin"]).query)

    auth = request.env["omniauth.auth"]
    id_token = auth.extra.id_token

    cookies[:id_token] = {
      value: id_token,
      expires: 6.hours.from_now,
      httponly: true, # No JavaScript access
      secure: ENV["SECURE_JWT_COOKIE"] == "true" || false,
      domain: Rails.env.production? ? ".#{ENV["APP_DOMAIN"]}" : nil,
      same_site: :strict
    }

    result =
      OmniauthUserResolver.new(
        auth: auth,
        invitation_token: origin_query["invitation_token"]
      ).call
    @user = result.user

    if @user&.valid? && @user.persisted?
      sign_in(resource_name, @user, store: false)
      request.reset_csrf_token # explicitly reset the CSRF token here for CSRF Fixation protection (we are not using Devise's config.clean_up_csrf_token_on_authentication because it is causing issues)
      redirect_to root_path
    else
      redirect_to_login_with_fail_reason(
        "denied",
        result.error_key,
        error_message: @user&.errors&.full_messages&.join(",")
      )
    end
  end

  def failure
    redirect_to_login_with_fail_reason(
      omniauth_login_fail_reason,
      omniauth_failure_message_key
    )
  end

  private

  def redirect_to_login_with_fail_reason(reason, message_key, message_opts = {})
    redirect_to login_path(
                  frontend_flash_message(
                    message_key,
                    "error",
                    message_opts: message_opts
                  ).merge("loginReason" => allowlisted_login_reason(reason))
                )
  end

  def allowlisted_login_reason(reason)
    LOGIN_FAIL_REASONS.include?(reason) ? reason : "unknown"
  end

  def omniauth_login_fail_reason
    type = omniauth_error_type
    return "error" if SERVICE_UNAVAILABLE_FAILURE_TYPES.include?(type)
    return "cancelled" if type == "access_denied"
    "unknown"
  end

  def omniauth_error_type
    request.get_header("omniauth.error.type").presence&.to_s ||
      params[:message].to_s
  end

  def omniauth_failure_message_key
    if SERVICE_UNAVAILABLE_FAILURE_TYPES.include?(omniauth_error_type)
      "omniauth.service_unavailable"
    else
      "omniauth.failure"
    end
  end
end
