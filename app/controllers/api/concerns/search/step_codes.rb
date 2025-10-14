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
    params.permit(
      :query,
      :page,
      :per_page,
      :show_archived,
      { sort: %i[field direction] },
      { filters: { type: [] } }
    )
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
    search_filters = (step_code_search_params[:filters] || {}).deep_dup
    show_archived =
      ActiveModel::Type::Boolean.new.cast(
        step_code_search_params[:show_archived] || false
      )

    # Base visibility: only records created by current user
    base_conditions = [{ creator_id: current_user.id }]

    final_where = { _and: [{ _or: base_conditions }] }

    # Add discarded filter
    final_where[:_and] << { discarded: show_archived }

    # OR within a filter (arrays), AND across different filters
    if search_filters[:type].present?
      final_where[:_and] << { type: search_filters[:type] }
    end

    final_where
  end
end
