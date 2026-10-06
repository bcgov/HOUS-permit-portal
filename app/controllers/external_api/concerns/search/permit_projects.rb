module ExternalApi::Concerns::Search::PermitProjects
  extend ActiveSupport::Concern

  def perform_permit_project_search
    # Always scoped to the API key's jurisdiction. The blank check is a second
    # gate in case authentication is bypassed.
    if current_external_api_key.blank? ||
         current_external_api_key.jurisdiction_id.blank?
      raise Pundit::NotAuthorizedError
    end

    search_conditions = {
      order: {
        created_at: {
          order: :desc,
          unmapped_type: "long"
        }
      },
      match: :word_middle,
      where: permit_project_where_clause,
      page: permit_project_search_params[:page].presence || 1,
      per_page:
        permit_project_search_params[:per_page].presence ||
          Kaminari.config.default_per_page,
      scope_results: ->(relation) { policy_scope([:external_api, relation]) }
    }

    @permit_project_search = PermitProject.search("*", **search_conditions)
  end

  private

  def permit_project_search_params
    params.permit(:page, :per_page, constraints: [:state])
  end

  def permit_project_where_clause
    where = {
      jurisdiction_id: current_external_api_key.jurisdiction_id,
      sandbox_id: current_sandbox&.id,
      discarded: false,
      state: {
        not: "draft"
      }
    }

    state = permit_project_search_params.dig(:constraints, :state)
    where[:state] = state if state.present? && state != "draft"

    where
  end
end
