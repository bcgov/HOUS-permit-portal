class Api::OmniauthCallbacksController < Devise::OmniauthCallbacksController
  include BaseControllerMethods

  def keycloak
    origin_query =
      Rack::Utils.parse_nested_query(URI(request.env["omniauth.origin"]).query)

    # Get auth data without logging sensitive information
    auth = request.env["omniauth.auth"]

    result =
      OmniauthUserResolver.new(
        auth: auth,
        invitation_token: origin_query["invitation_token"]
      ).call
    binding.pry
    # Store the ID token directly in the user object for use in jwt_payload
    @user = result.user
    @user.keycloak_id_token = auth.extra.id_token if auth
      .extra
      .id_token
      .present?

    if @user&.valid? && @user&.persisted?
      sign_in(resource_name, @user, store: false)
      request.reset_csrf_token # explicitly reset the CSRF token here for CSRF Fixation protection (we are not using Devise's config.clean_up_csrf_token_on_authentication because it is causing issues)
      redirect_to root_path
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
    redirect_to login_path(frontend_flash_message("omniauth.failure", "error"))
  end
end
