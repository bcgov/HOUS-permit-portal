class Api::ApplicationController < ActionController::API
  include BaseControllerMethods
  include Pundit::Authorization

  before_action :authenticate_user!
  before_action :store_currents
  before_action :configure_permitted_parameters, if: :devise_controller?

  rescue_from Pundit::NotAuthorizedError, with: :user_not_authorized

  after_action :verify_authorized, except: %i[index], unless: :skip_pundit?
  after_action :verify_policy_scoped, only: %i[index], unless: :skip_pundit?

  def index
    # This parent application controller throws errors from above after_actions
    # if the subclass does not implement this method. This is provided as a fallback.
    raise NotImplementedError, "The index method is not implemented."
  end

  protected

  def apply_search_authorization(results, policy_action = action_name)
    results.select { |result| policy(result).send("#{policy_action}?".to_sym) }
  end

  def skip_pundit?
    devise_controller?
  end

  def configure_permitted_parameters
    devise_parameter_sanitizer.permit(:sign_in, keys: [:username])
    # Also add :username to sign_up and account_update if needed
  end

  def user_not_authorized(exception)
    render_error(
      "misc.user_not_authorized_error",
      { message_opts: { error_message: exception.message }, status: 403 },
      exception,
    ) and return
  end
end
