class Api::ProjectActivitiesController < Api::ApplicationController
  include Api::Concerns::Search::ProjectActivities

  before_action :set_permit_project
  skip_after_action :verify_policy_scoped, only: %i[index]

  def index
    perform_project_activity_search
    authorized_results = apply_search_authorization(@search.results)
    formatted =
      authorized_results.map do |audit|
        ProjectActivityPresenter.format(audit, viewer: current_user)
      end

    render_success formatted,
                   nil,
                   {
                     blueprint: ProjectActivityBlueprint,
                     blueprint_opts: {
                       view: :base
                     },
                     meta: page_meta(@search)
                   }
  end

  private

  def set_permit_project
    @permit_project = PermitProject.find(params[:id])
  end
end
