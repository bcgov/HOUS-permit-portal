class Api::PermitProjectsController < Api::ApplicationController
  include Api::Concerns::Search::PermitProjects # Include the new concern

  before_action :set_permit_project, only: %i[show update]

  # TODO: If you create a search concern similar to Api::Concerns::Search::PermitApplications,
  # include it here for more advanced search parameter handling.
  # e.g., include Api::Concerns::Search::PermitProjects

  skip_after_action :verify_policy_scoped, only: [:index]

  def index
    perform_permit_project_search # This method now comes from the concern

    # Apply your iterative authorization method to the Searchkick results.
    # This will use PermitProjectPolicy#index? for each instance.
    authorized_results =
      apply_search_authorization(@permit_project_search.results)

    render_success authorized_results,
                   nil,
                   {
                     meta: {
                       total_pages: @permit_project_search.total_pages,
                       total_count: @permit_project_search.total_count,
                       current_page: @permit_project_search.current_page
                     },
                     blueprint: PermitProjectBlueprint
                   }
  end

  def show
    authorize @permit_project
    render_success @permit_project,
                   nil,
                   {
                     blueprint: PermitProjectBlueprint,
                     blueprint_opts: {
                       view: :extended
                     }
                   }
  end

  def update
    authorize @permit_project
    if @permit_project.update(permit_project_params)
      render_success @permit_project,
                     nil,
                     {
                       blueprint: PermitProjectBlueprint,
                       blueprint_opts: {
                         view: :extended
                       }
                     }
    else
      render_error @permit_project.errors, :unprocessable_entity
    end
  end

  private

  def set_permit_project
    @permit_project = PermitProject.find(params[:id])
  end

  def permit_project_params
    params.require(:permit_project).permit(
      :description,
      project_documents_attributes: [
        :id,
        :permit_project_id,
        :_destroy,
        file: [:id, :storage, metadata: %i[size filename mime_type]]
      ]
    )
  end

  # Private method perform_permit_project_search is now removed as it's in the concern.

  # Define other actions like show, create, update, destroy as needed
end
