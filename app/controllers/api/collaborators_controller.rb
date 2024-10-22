class Api::CollaboratorsController < Api::ApplicationController
  include Api::Concerns::Search::Collaborators

  before_action :set_collaboratorable, only: [:collaborator_search]
  skip_after_action :verify_authorized, only: [:collaborator_search]

  def collaborator_search
    perform_collaborator_search
    authorized_results =
      apply_search_authorization(
        @collaborator_search.results,
        "collaborator_search"
      )
    render_success authorized_results,
                   nil,
                   {
                     meta: {
                       total_pages: @collaborator_search.total_pages,
                       total_count: @collaborator_search.total_count,
                       current_page: @collaborator_search.current_page
                     },
                     blueprint: CollaboratorBlueprint
                   }
  end

  private

  def set_collaboratorable
    @collaboratorable =
      Collaborator.find_by!(
        collaboratorable_id: params[:collaboratorable_id]
      ).collaboratorable
  end
end
