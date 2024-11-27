module Api::Concerns::Search::Jurisdictions
  extend ActiveSupport::Concern

  def perform_search(allow_admin_fields: false)
    search_params = {
      order: jurisdiction_order,
      match: :word_start,
      page: jurisdiction_search_params[:page],
      per_page:
        (
          if jurisdiction_search_params[:page]
            (
              jurisdiction_search_params[:per_page] ||
                Kaminari.config.default_per_page
            )
          else
            nil
          end
        )
    }

    # Conditionally add the `where` clause
    search_params[
      :where
    ] = jurisdiction_where_clause unless jurisdiction_where_clause.nil?
    search_params[:fields] = (
      if allow_admin_fields
        (
          Jurisdiction::SEARCH_DATA_FIELDS +
            Jurisdiction::SUPER_ADMIN_ADDITIONAL_DATA_FIELDS
        )
      else
        Jurisdiction::SEARCH_DATA_FIELDS
      end
    )
    @search =
      Jurisdiction.search(
        jurisdiction_query,
        **search_params,
        includes: Jurisdiction::BASE_INCLUDES
      )
  end

  private

  def jurisdiction_search_params
    params.permit(
      :query,
      :page,
      :per_page,
      filters: [:submission_inbox_set_up],
      sort: %i[field direction]
    )
  end

  def jurisdiction_query
    if jurisdiction_search_params[:query].present?
      jurisdiction_search_params[:query]
    else
      "*"
    end
  end

  def jurisdiction_order
    if (sort = jurisdiction_search_params[:sort])
      { sort[:field] => { order: sort[:direction], unmapped_type: "long" } }
    else
      { name: { order: :asc, unmapped_type: "long" } }
    end
  end

  def jurisdiction_where_clause
    jurisdiction_search_params[:filters]
  end
end
