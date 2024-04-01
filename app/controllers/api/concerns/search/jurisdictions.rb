module Api::Concerns::Search::Jurisdictions
  extend ActiveSupport::Concern

  def perform_search
    @search =
      Jurisdiction.search(
        jurisdiction_query,
        order: jurisdiction_order,
        match: :word_start,
        page: jurisdiction_search_params[:page],
        per_page:
          (
            if jurisdiction_search_params[:page]
              (jurisdiction_search_params[:per_page] || Kaminari.config.default_per_page)
            else
              nil
            end
          ),
      )
  end

  private

  def jurisdiction_search_params
    params.permit(:query, :page, :per_page, sort: %i[field direction])
  end

  def jurisdiction_query
    jurisdiction_search_params[:query].present? ? jurisdiction_search_params[:query] : "*"
  end

  def jurisdiction_order
    if (sort = jurisdiction_search_params[:sort])
      { sort[:field] => { order: sort[:direction], unmapped_type: "long" } }
    else
      { name: { order: :asc, unmapped_type: "long" } }
    end
  end
end
