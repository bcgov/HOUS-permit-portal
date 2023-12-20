class Api::JurisdictionsController < Api::ApplicationController
  before_action :set_jurisdiction, only: [:show]

  def index
    @jurisdictions = Jurisdiction.all
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
    render_error(Constants::Error::INVALID_TOKEN_ERROR, nil, status: :not_found)
  end
end
