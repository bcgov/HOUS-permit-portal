class Api::UserActivitiesController < Api::ApplicationController
  skip_after_action :verify_policy_scoped, only: %i[index]
  
  def index
    user = current_user
    feature_name = params[:feature_name]
    jurisdiction = params[:jurisdiction]
    action = params[:action]  # e.g., "enabled" or "disabled"

    # Log the activity
    ActivityLogger.log_activity(user, feature_name, jurisdiction, action)

    render json: { message: 'Activity logged successfully' }, status: :ok
  end
end
