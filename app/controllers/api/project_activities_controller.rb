class Api::ProjectActivitiesController < Api::ApplicationController
  include Api::Concerns::Search::ProjectActivities

  before_action :set_permit_project
  # [AUDITS SUGGESTION] verify_policy_scoped is now satisfied by the
  # scope_results: policy_scope(...) in the search concern, so we no longer
  # need to skip it. verify_authorized is skipped because we authorize the
  # project explicitly rather than each audit record.
  skip_after_action :verify_authorized, only: %i[index]

  def index
    authorize @permit_project, :show?
    perform_project_activity_search

    # [AUDITS SUGGESTION] The presenter already returns hashes in the exact
    # shape the frontend needs — passing them through a Blueprinter blueprint
    # would fail (Blueprinter calls methods, not hash keys). Render directly.
    formatted =
      @search.results.map do |audit|
        ProjectActivityPresenter.format(audit, viewer: current_user)
      end

    render json: { data: formatted, meta: page_meta(@search) }
  end

  private

  def set_permit_project
    @permit_project = PermitProject.find(params[:id])
  end
end
