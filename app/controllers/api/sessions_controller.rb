class Api::SessionsController < Devise::SessionsController
  include BaseControllerMethods
  respond_to :json

  skip_before_action :verify_signed_out_user

  def destroy
    # Try to get the ID token from the JWT payload
    id_token = nil
    token = request.headers["Authorization"]&.split(" ")&.last

    if token.present?
      begin
        decoded_token =
          JWT.decode(
            token,
            ENV["DEVISE_JWT_SECRET_KEY"],
            true,
            { algorithm: "HS256" }
          )
        id_token = decoded_token.first["kc_id_token"]
      rescue JWT::DecodeError
        # Silently continue if token can't be decoded
      end
    end
    binding.pry
    # Sign the user out locally
    Devise.sign_out_all_scopes ? sign_out : sign_out(resource_name)

    # Clear the session
    reset_session

    # If there's an ID token, redirect to Keycloak logout
    if id_token.present? && ENV["LOGINPROXY_LOGOUT_URL"].present?
      redirect_url = ENV["VITE_POST_LOGOUT_REDIRECT_URL"] || root_url
      logout_url =
        "#{ENV["LOGINPROXY_LOGOUT_URL"]}?post_logout_redirect_uri=#{CGI.escape(redirect_url)}&id_token_hint=#{id_token}"
      redirect_to logout_url, allow_other_host: true
    else
      # Otherwise just return success
      render_success nil, "user.logout_success"
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
