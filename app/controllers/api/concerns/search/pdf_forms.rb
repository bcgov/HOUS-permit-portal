# [OVERHEATING AUDIT] Lead note: You seem to have missed the point entirely here
# please see app/controllers/api/concerns/search/jurisdictions.rb for how to set up search with searchkick
module Api::Concerns::Search::PdfForms
  extend ActiveSupport::Concern

  def search_params
    params.permit(
      :query,
      :page,
      :per_page,
      filters: [:status_filter],
      sort: %i[field direction]
    )
  end

  def status_filter
    search_params.dig(:filters, :status_filter)
  end

  def perform_search
    @search =
      policy_scope(PdfForm)
        .order(order)
        .page(search_params[:page])
        .per(search_params[:per_page] || Kaminari.config.default_per_page)

    if search_params[:query].present?
      # Simple search on form_json for now, matching the frontend hand-rolled behavior
      # [OVERHEATING AUDIT] Mini-lesson: this will not scale.
      # `LOWER(form_json::text) LIKE '%query%'` is a full scan and will get slow fast.
      # Move the searchable fields into real columns and use the established Searchkick pattern
      # like Jurisdictions does, so queries are indexed and sortable.
      query = "%#{search_params[:query].downcase}%"
      @search = @search.where("LOWER(form_json::text) LIKE ?", query)
    end

    if status_filter.present? && status_filter != "all"
      status = status_filter == "unarchived"
      @search = @search.where(status: status)
    end
  end

  def order
    if (sort = search_params[:sort])
      field =
        case sort[:field]
        when "projectNumber"
          "form_json ->> 'projectNumber'"
        else
          "created_at"
        end
      "#{field} #{sort[:direction] || "desc"}"
    else
      "created_at desc"
    end
  end
end
