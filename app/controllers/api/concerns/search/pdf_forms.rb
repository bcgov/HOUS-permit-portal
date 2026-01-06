module Api::Concerns::Search::PdfForms
  extend ActiveSupport::Concern

  def perform_search
    @search =
      PdfForm.search(
        search_query,
        where: where_clause,
        order: order_clause,
        match: :word_start,
        page: search_params[:page],
        per_page:
          (
            if search_params[:page]
              search_params[:per_page] || Kaminari.config.default_per_page
            else
              nil
            end
          )
      )
    # [OVERHEATING AUDIT] Here you want to set the policy_scope kind of like
    # scope_results: ->(relation) { policy_scope(relation) }
    # (see app/controllers/api/concerns/search/permit_applications.rb)
  end

  private

  def search_params
    params.permit(
      :query,
      :page,
      :per_page,
      filters: [:status_filter],
      sort: %i[field direction]
    )
  end

  def search_query
    search_params[:query].present? ? search_params[:query] : "*"
  end

  def where_clause
    clauses = {}

    if (status_filter = search_params.dig(:filters, :status_filter))
      if status_filter != "all"
        clauses[:status] = (status_filter == "unarchived")
      end
    end

    clauses
  end

  def order_clause
    if (sort = search_params[:sort])
      field =
        case sort[:field]
        when "projectNumber"
          "project_number"
        when "address"
          "address"
        else
          "created_at"
        end
      { field => { order: sort[:direction] || "desc", unmapped_type: "long" } }
    else
      { created_at: { order: :desc, unmapped_type: "long" } }
    end
  end
end
