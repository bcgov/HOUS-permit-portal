module Api::Concerns::Search::StepCodes
  extend ActiveSupport::Concern

  def perform_step_code_search
    search_conditions = {
      order: step_code_order,
      where: step_code_where_clause,
      page: step_code_search_params[:page],
      per_page:
        (
          if step_code_search_params[:page]
            (
              step_code_search_params[:per_page] ||
                Kaminari.config.default_per_page
            )
          else
            nil
          end
        )
    }

    @step_code_search = StepCode.search(step_code_query, **search_conditions)
  end

  private

  def step_code_search_params
    params.permit(:query, :page, :per_page, sort: %i[field direction])
  end

  def step_code_query
    step_code_search_params[:query].presence || "*"
  end

  def step_code_order
    if (sort = step_code_search_params[:sort])
      # Frontend uses camelCase; Searchkick expects snake_case for underlying fields. Map as needed.
      field = sort[:field]
      { field => { order: sort[:direction], unmapped_type: "long" } }
    else
      { created_at: { order: :desc, unmapped_type: "long" } }
    end
  end

  def step_code_where_clause
    { creator_id: current_user.id }
  end
end
