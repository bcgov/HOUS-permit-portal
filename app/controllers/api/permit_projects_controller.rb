class Api::PermitProjectsController < Api::ApplicationController
  include Api::Concerns::Search::PermitProjects # Include the new concern

  # TODO: If you create a search concern similar to Api::Concerns::Search::PermitApplications,
  # include it here for more advanced search parameter handling.
  # e.g., include Api::Concerns::Search::PermitProjects

  skip_after_action :verify_policy_scoped, only: [:index]

  def index
    # Initial action authorization (if any, e.g., access_list? if defined in policy)
    # authorize PermitProject, :access_list? # This was discussed; re-add if needed for general action gating.

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
                     blueprint: PermitProjectBlueprint,
                     blueprint_opts: {
                       view: :base
                     }
                   }
  end

  private

  # Private method perform_permit_project_search is now removed as it's in the concern.

  # Define other actions like show, create, update, destroy as needed
end
