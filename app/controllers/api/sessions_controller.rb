class Api::SessionsController < Devise::SessionsController
  include BaseControllerMethods
  respond_to :json

  skip_before_action :verify_signed_out_user

  def destroy
    id_token = cookies[:id_token]
    # Delete the frontend-accessible id_token cookie
    cookies.delete(:id_token, path: "/", domain: nil)

    Devise.sign_out_all_scopes ? sign_out : sign_out(resource_name)

    # Use the token for the Keycloak logout if available
    if id_token.present? && ENV["LOGINPROXY_LOGOUT_URL"].present?
      redirect_url = ENV["VITE_POST_LOGOUT_REDIRECT_URL"] || root_url
      logout_url =
        "#{ENV["LOGINPROXY_LOGOUT_URL"]}?post_logout_redirect_uri=#{CGI.escape(redirect_url)}&id_token_hint=#{id_token}"

      # Return JSON with redirect URL for frontend to handle
      render json: {
               status: "success",
               message: "user.logout_success",
               logout_url: logout_url
             }
    else
      render_error "user.logout_error"
    end
  end

  def validate_token
    authenticate_user!
    if current_user
      warden.authenticate({ scope: :user })
      render_success current_user, nil, { blueprint_opts: { view: :extended } }
    else
      # clear the cookie so user can try and login again
      name, cookie = Devise::JWT::Cookie::CookieHelper.new.build(nil)
      Rack::Utils.set_cookie_header!(headers, name, cookie)
      render_error(nil, status: :unauthorized)
    end
  end
end
