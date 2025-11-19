class Api::ApplicationController < ActionController::API
  include BaseControllerMethods
  include Pundit::Authorization
  include CurrentSandbox

  before_action :authenticate_user!
  before_action :store_currents
  before_action :require_confirmation

  rescue_from Pundit::NotAuthorizedError, with: :user_not_authorized

  after_action :verify_authorized, except: %i[index], unless: :skip_pundit?
  after_action :verify_policy_scoped, only: %i[index], unless: :skip_pundit?

  def index
    # This parent application controller throws errors from above after_actions
    # if the subclass does not implement this method. This is provided as a fallback.
    raise NotImplementedError, "The index method is not implemented."
  end

  protected

  def page_meta(search_results)
    {
      total_pages: search_results.total_pages,
      total_count: search_results.total_count,
      current_page: search_results.current_page,
      per_page: search_results.limit_value
    }
  end

  def apply_search_authorization(results, policy_action = action_name)
    results.select { |result| policy(result).send("#{policy_action}?".to_sym) }
  end

  def skip_pundit?
    devise_controller?
  end

  def user_not_authorized(exception)
    render_error(
      "misc.user_not_authorized_error",
      { message_opts: { error_message: exception.message }, status: 403 },
      exception
    ) and return
  end

  def require_confirmation
    redirect_to root_path if current_user && !current_user.confirmed?
  end

  def pundit_user
    UserContext.new(current_user, current_sandbox)
  end
end
