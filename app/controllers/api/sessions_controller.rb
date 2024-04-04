class Api::SessionsController < Devise::SessionsController
  include BaseControllerMethods
  respond_to :json

  skip_before_action :verify_signed_out_user

  def create
    user = User.find_by(username: params[:user][:username])
    return render_error("user.login_error", status: :unauthorized) if user.present? && user.discarded?
    return render_error("user.not_confirmed_error", status: :unauthorized) if user.present? && !user.confirmed?
    self.resource = warden.authenticate(auth_options)
    return render_error("user.login_error", status: :unauthorized) unless self.resource.present?
    set_flash_message!(:notice, :signed_in)
    sign_in(resource_name, resource)
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
      render_error(nil, status: :unauthorized)
    end
  end
end
