module Api::Concerns::Search::OverheatingCodes
  extend ActiveSupport::Concern

  def perform_overheating_code_search
    search_conditions = {
      order: overheating_code_order,
      where: overheating_code_where_clause,
      page: overheating_code_search_params[:page],
      per_page:
        (
          if overheating_code_search_params[:page]
            (
              overheating_code_search_params[:per_page] ||
                Kaminari.config.default_per_page
            )
          else
            nil
          end
        ),
      scope_results: ->(relation) { policy_scope(relation) }
    }
    @overheating_code_search =
      OverheatingCode.search(overheating_code_query, **search_conditions)
  end

  private

  def overheating_code_search_params
    params.permit(
      :query,
      :page,
      :per_page,
      :show_archived,
      { sort: %i[field direction] }
    )
  end

  def overheating_code_query
    overheating_code_search_params[:query].presence || "*"
  end

  def overheating_code_order
    if (sort = overheating_code_search_params[:sort])
      field = sort[:field]
      { field => { order: sort[:direction], unmapped_type: "keyword" } }
    else
      { created_at: { order: :desc, unmapped_type: "long" } }
    end
  end

  def overheating_code_where_clause
    show_archived =
      ActiveModel::Type::Boolean.new.cast(
        overheating_code_search_params[:show_archived] || false
      )
    { creator_id: current_user.id, discarded: show_archived }
  end
end
