class Api::JurisdictionsController < Api::ApplicationController
  before_action :set_jurisdiction, only: %i[show users]

  def index
    # TODO: Search, sort, pagination
    @jurisdictions = policy_scope(Jurisdiction).first(10)
    render_success(@jurisdictions)
  end

  # GET /api/jurisdictions/:id
  def show
    render_success(@jurisdiction)
  end

  # GET /api/jurisdictions/:id/users
  def users
    # TODO: searchkiq
    render_success(@jurisdiction.users)
  end

  private

  def set_jurisdiction
    @jurisdiction = Jurisdiction.find(params[:id])
  rescue ActiveRecord::RecordNotFound
    render_error(Constants::Error::NOT_FOUND_ERROR, "misc.not_found_error", status: :not_found)
  end
end
