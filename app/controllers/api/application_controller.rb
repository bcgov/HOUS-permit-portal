class Api::ApplicationController < ActionController::API
  include BaseControllerMethods

  before_action :authenticate_user!
  before_action :configure_permitted_parameters, if: :devise_controller?

  protected

  def configure_permitted_parameters
    devise_parameter_sanitizer.permit(:sign_in, keys: [:username])
    # Also add :username to sign_up and account_update if needed
  end
end
