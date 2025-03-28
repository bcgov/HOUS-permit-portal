class Api::SessionsController < Devise::SessionsController
  include BaseControllerMethods
  respond_to :json

  skip_before_action :verify_signed_out_user

  def destroy
    Devise.sign_out_all_scopes ? sign_out : sign_out(resource_name)

    # TODO: Redirect to:
    # "#{ENV["LOGINPROXY_LOGOUT_URL"]}?post_logout_redirect_uri=#{VITE_POST_LOGOUT_REDIRECT_URL}&id_token_hint=#{id_token}"

    render_success nil, "user.logout_success"
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
