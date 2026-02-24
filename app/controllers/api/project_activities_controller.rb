class Api::ProjectActivitiesController < Api::ApplicationController
  before_action :set_permit_project

  # GET /api/permit_projects/:permit_project_id/activities
  #
  # Returns paginated activity feed entries for a project.
  # Reuses the PermitProjectPolicy#show? check — if you can view the project,
  # you can view its activity.
  #
  # Query params:
  #   page     - page number (default: 1)
  #   per_page - items per page (default: 20)
  #
  # [AUDITED VIBES TODO]: Wire up ProjectActivityService + ProjectActivityBlueprint
  # once the service is implemented.
  #
  # [AUDITED VIBES TODO]: Add filter params for:
  #   - permit_application_name (filter by permit)
  #   - username (filter by actor)
  #   - jurisdiction_name (filter by jurisdiction)
  #   - sort: "most_recent" (default) or "least_recent"
  #   See: Filtering & Sorting spec
  def index
    authorize @permit_project, :show?

    # [AUDITED VIBES TODO]: Replace stub response with real implementation:
    #
    # result = ProjectActivityService.fetch_project_activities(
    #   @permit_project,
    #   viewer: current_user,
    #   page: params[:page] || 1,
    #   per_page: params[:per_page] || 20
    # )
    #
    # render_success result[:activities],
    #                nil,
    #                {
    #                  blueprint: ProjectActivityBlueprint,
    #                  blueprint_opts: { view: :base },
    #                  meta: result[:meta]
    #                }

    render json: {
             data: [],
             meta: {
               current_page: 1,
               total_pages: 0,
               total_count: 0
             }
           }
  end

  private

  def set_permit_project
    @permit_project = PermitProject.find(params[:permit_project_id])
  end
end
