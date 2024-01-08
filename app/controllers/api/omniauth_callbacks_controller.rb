class Api::OmniauthCallbacksController < Devise::OmniauthCallbacksController
  def keycloakopenid
    @user = User.from_omniauth(request.env["omniauth.auth"])
    if @user.persisted?
      sign_in(resource_name, @user, store: false)
      redirect_to root_path
    else
      redirect_to login_path
    end
  end

  def failure
    redirect_to login_path
  end
end
