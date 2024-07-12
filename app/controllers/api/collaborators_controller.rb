class Api::CollaboratorsController < Api::ApplicationController
  include Api::Concerns::Search::Collaborators

  before_action :set_collaboratorable, only: [:collaborator_search]
  skip_after_action :verify_policy_scoped, only: [:collaborator_search]

  def collaborator_search
    perform_collaborator_search
    authorized_results = apply_search_authorization(@collaborator_search.results)
    render_success authorized_results,
                   nil,
                   {
                     meta: {
                       total_pages: @permit_application_search.total_pages,
                       total_count: @permit_application_search.total_count,
                       current_page: @permit_application_search.current_page,
                     },
                     blueprint: PermitApplicationBlueprint,
                     blueprint_opts: {
                       view: :base,
                     },
                   }
  end

  def create
  end

  private

  def set_collaboratorable
    @collaboratorable = Collaborator.find_by!(collaboratorable_id: params[:collaboratorable_id])
  end
end
