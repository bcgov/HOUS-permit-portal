module Api::Concerns::Search::PreChecks
  extend ActiveSupport::Concern

  def perform_pre_check_search
    search_conditions = {
      order: pre_check_order,
      where: pre_check_where_clause,
      page: pre_check_search_params[:page],
      per_page:
        (
          if pre_check_search_params[:page]
            (
              pre_check_search_params[:per_page] ||
                Kaminari.config.default_per_page
            )
          else
            nil
          end
        ),
      scope_results: ->(relation) { policy_scope(relation) }
    }
    @pre_check_search = PreCheck.search(pre_check_query, **search_conditions)
  end

  private

  def pre_check_search_params
    params.permit(:query, :page, :per_page, { sort: %i[field direction] })
  end

  def pre_check_query
    pre_check_search_params[:query].presence || "*"
  end

  def pre_check_order
    if (sort = pre_check_search_params[:sort])
      field = sort[:field]
      { field => { order: sort[:direction], unmapped_type: "keyword" } }
    else
      { created_at: { order: :desc, unmapped_type: "long" } }
    end
  end

  def pre_check_where_clause
    { creator_id: current_user.id }
  end
end
