class Api::JurisdictionsController < Api::ApplicationController
  include Pundit
  before_action :set_jurisdiction, only: [:show]

  def index
    @jurisdictions = policy_scope(Jurisdiction)
    render_success(@jurisdictions)
  end

  # GET /api/jurisdictions/:id
  def show
    render_success(@jurisdiction)
  end

  private

  def set_jurisdiction
    @jurisdiction = Jurisdiction.find(params[:id])
  rescue ActiveRecord::RecordNotFound
    render_error(Constants::Error::NOT_FOUND_ERROR, "misc.not_found_error", status: :not_found)
  end
end
