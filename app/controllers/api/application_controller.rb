class Api::ApplicationController < ActionController::API
  include BaseControllerMethods
  include Pundit::Authorization

  before_action :authenticate_user!
  before_action :configure_permitted_parameters, if: :devise_controller?

  rescue_from Pundit::NotAuthorizedError, with: :user_not_authorized

  after_action :verify_authorized, except: %i[index], unless: :skip_pundit?
  after_action :verify_policy_scoped, only: %i[index], unless: :skip_pundit?

  protected

  def skip_pundit?
    devise_controller?
  end

  def configure_permitted_parameters
    devise_parameter_sanitizer.permit(:sign_in, keys: [:username])
    # Also add :username to sign_up and account_update if needed
  end
end
