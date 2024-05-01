class Api::OmniauthCallbacksController < Devise::OmniauthCallbacksController
  include BaseControllerMethods

  def keycloak
    auth = request.env["omniauth.auth"]
    invited_user&.accept_invitation_with_omniauth(auth)
    @user = invited_user || User.from_omniauth(auth)
    if @user&.valid? && @user&.persisted?
      sign_in(resource_name, @user, store: false)
      redirect_to root_path
    else
      error_key = @user ? "omniauth.failure_with_message" : "omniauth.unavailable"
      redirect_to login_path frontend_flash_message(
                               error_key,
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

  private

  # ideally, we would pass a param through when calling the omniauth endpoint to make it more explicit that this is coming from a devise invitation
  # see https://github.com/ccrockett/omniauth-keycloak/issues/44
  def invited_user
    return @invited_user if @invited_user
    origin_query = Rack::Utils.parse_nested_query(URI(request.env["omniauth.origin"]).query)
    return unless origin_query["invitation_token"].present?
    @invited_user = User.find_by_invitation_token(origin_query["invitation_token"], true)
  end
end
