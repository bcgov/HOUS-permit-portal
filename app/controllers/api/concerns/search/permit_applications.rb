module Api::Concerns::Search::PermitApplications
  extend ActiveSupport::Concern

  def perform_permit_application_search
    search_conditions = {
      order: permit_application_order,
      match: :word_start,
      where: permit_application_where_clause,
      page: permit_application_search_params[:page],
      per_page:
        (
          if permit_application_search_params[:page]
            (permit_application_search_params[:per_page] || Kaminari.config.default_per_page)
          else
            nil
          end
        ),
    }

    @permit_application_search = PermitApplication.search(permit_application_query, **search_conditions)
  end

  private

  def permit_application_search_params
    params.permit(
      :query,
      :page,
      :per_page,
      filters: %i[status template_version_id requirement_template_id],
      sort: %i[field direction],
    )
  end

  def permit_application_query
    permit_application_search_params[:query].present? ? permit_application_search_params[:query] : "*"
  end

  def permit_application_order
    if (sort = permit_application_search_params[:sort])
      { sort[:field] => { order: sort[:direction], unmapped_type: "long" } }
    elsif current_user.submitter?
      { created_at: { order: :desc, unmapped_type: "long" } }
    else
      { number: { order: :desc, unmapped_type: "long" } }
    end
  end

  def permit_application_where_clause
    filters = permit_application_search_params[:filters]
    where = {}

    # Add the submitter ID if the user is a submitter. Necessary even with search auth filtering for consisent pagination
    # Only add the jurisdiction_id condition if @jurisdiction is present
    if @jurisdiction
      where = {
        jurisdiction_id: @jurisdiction.id,
        # Overrides status filter, reorder the code if necessary
        status: %i[submitted],
      }
    else
      where = { submitter_id: current_user.id }
    end

    where.merge!(filters.to_h.deep_symbolize_keys.compact) if filters.present?

    where
  end
end
