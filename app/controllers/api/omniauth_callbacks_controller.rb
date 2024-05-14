class Api::OmniauthCallbacksController < Devise::OmniauthCallbacksController
  include BaseControllerMethods

  def keycloak
    binding.pry
    origin_query = Rack::Utils.parse_nested_query(URI(request.env["omniauth.origin"]).query)
    result =
      OmniauthUserResolver.new(
        auth: request.env["omniauth.auth"],
        invitation_token: origin_query["invitation_token"],
      ).call
    @user = result.user

    if @user&.valid? && @user&.persisted?
      sign_in(resource_name, @user, store: false)
      redirect_to root_path
    else
      redirect_to login_path frontend_flash_message(
                               result.error_key,
                               "error",
                               message_opts: {
                                 error_message: @user&.errors&.full_messages&.join(","),
                               },
                             )
    end
  end

  def failure
    redirect_to login_path, frontend_flash_message("omniauth.failure", "error")
  end
end
