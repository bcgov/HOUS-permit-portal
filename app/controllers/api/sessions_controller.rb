class Api::SessionsController < Devise::SessionsController
  include BaseControllerMethods
  respond_to :json

  skip_before_action :verify_signed_out_user

  def create
    # override by manually throwing the error in our format for front end
    user = warden.authenticate(auth_options)
    return render_error(Constants::Error::USER_LOGIN_ERROR, "user.login_error", status: :unauthorized) unless user

    self.resource = user

    # override this using store: false so that it does not create a warden session
    sign_in(resource_name, resource, store: false)
    yield resource if block_given?
    render_success current_user, nil, { blueprint_opts: { view: :extended } }
  end

  def destroy
    signed_out = (Devise.sign_out_all_scopes ? sign_out : sign_out(resource_name))
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
      render_error(Constants::Error::INVALID_TOKEN_ERROR, nil, status: :unauthorized)
    end
  end
end
