class Api::SessionsController < Devise::SessionsController
  include BaseControllerMethods
  include CurrentSandbox
  respond_to :json

  skip_before_action :verify_signed_out_user
  before_action :ensure_local_password_auth!, only: :create

  def destroy
    id_token = cookies[:id_token]
    # Delete the frontend-accessible id_token cookie
    cookies.delete(
      :id_token,
      path: "/",
      domain: Rails.env.production? ? ".#{ENV["APP_DOMAIN"]}" : nil
    )

    Devise.sign_out_all_scopes ? sign_out : sign_out(resource_name)
    reset_session

    # Use the token for the Keycloak logout if available
    if id_token.present? && ENV["KEYCLOAK_LOGOUT_URL"].present?
      redirect_url = ENV["POST_LOGOUT_REDIRECT_URL"] || root_url
      logout_url =
        "#{ENV["KEYCLOAK_LOGOUT_URL"]}?post_logout_redirect_uri=#{CGI.escape(redirect_url)}&id_token_hint=#{id_token}"
    else
      # Local password sessions (and other non-Keycloak logins) have no id_token
      logout_url = ENV["POST_LOGOUT_REDIRECT_URL"] || root_url
    end

    render json: {
             status: "success",
             message: I18n.t("user.logout_success"),
             logout_url: logout_url
           }
  end

  def validate_token
    authenticate_user!
    if current_user
      warden.authenticate({ scope: :user })
      render_success current_user,
                     nil,
                     {
                       blueprint_opts: {
                         view: :extended,
                         current_sandbox: current_sandbox
                       }
                     }
    else
      # clear the cookie so user can try and login again
      name, cookie = Devise::JWT::Cookie::CookieHelper.new.build(nil)
      Rack::Utils.set_cookie_header!(headers, name, cookie)
      render_error(nil, status: :unauthorized)
    end
  end

  private

  def local_password_auth_enabled?
    !Rails.env.production? && ENV["ENABLE_LOCAL_PASSWORD_AUTH"] == "true"
  end

  def ensure_local_password_auth!
    head :not_found unless local_password_auth_enabled?
  end
end
