class Api::OmniauthCallbacksController < Devise::OmniauthCallbacksController
  include BaseControllerMethods

  SERVICE_UNAVAILABLE_FAILURE_TYPES = %w[
    service_unavailable
    temporarily_unavailable
  ].freeze

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
      redirect_to omniauth_success_path
    else
      redirect_to login_path(
                    frontend_flash_message(
                      result.error_key,
                      "error",
                      message_opts: {
                        error_message: @user&.errors&.full_messages&.join(",")
                      }
                    )
                  )
    end
  end

  def failure
    redirect_to login_path(
                  frontend_flash_message(omniauth_failure_message_key, "error")
                )
  end

  private

  def omniauth_failure_message_key
    puts "request.get_header('omniauth.error.type'): #{request.get_header("omniauth.error.type")}"
    if SERVICE_UNAVAILABLE_FAILURE_TYPES.include?(
         request.get_header("omniauth.error.type").to_s
       )
      "omniauth.service_unavailable"
    else
      "omniauth.failure"
    end
  end

  def omniauth_success_path
    origin = request.env["omniauth.origin"].to_s
    return root_path if origin.blank?

    uri = URI.parse(origin)
    return root_path unless uri.path == "/accept-project-invitation"
    return root_path if uri.host.present? && uri.host != request.host

    uri.query.present? ? "#{uri.path}?#{uri.query}" : uri.path
  rescue URI::InvalidURIError
    root_path
  end
end
