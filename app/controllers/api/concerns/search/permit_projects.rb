module Api::Concerns::Search::PermitProjects
  extend ActiveSupport::Concern

  # Public method to be called by the controller
  def perform_permit_project_search
    search_conditions = {
      order: permit_project_order,
      match: :word_middle, # Default match type, can be customized
      fields: [
        # Define default searchable fields for PermitProject
        # These should align with what's indexed in PermitProject.search_data
        { description: :word_middle },
        { nickname: :word_middle }, # Delegated from primary_permit_application
        { full_address: :word_middle }, # Delegated
        { number: :text_end }, # Delegated
        { status: :word_middle } # Delegated
      ],
      where: permit_project_where_clause,
      page: permit_project_search_params[:page],
      per_page:
        (
          if permit_project_search_params[:page]
            (
              permit_project_search_params[:per_page] ||
                Kaminari.config.default_per_page
            )
          else
            nil # No pagination if no page is specified
          end
        ),
      includes: [:primary_permit_application] # Eager load for policy checks and blueprint
    }
    @permit_project_search =
      PermitProject.search(permit_project_query, **search_conditions)
  end

  private

  # Strong parameters for project search
  def permit_project_search_params
    params.permit(
      :query,
      :page,
      :per_page,
      filters: [ # Define potential filters here
      # e.g., :jurisdiction_id, { status: [] }
      ],
      sort: %i[field direction]
    )
  end

  # Determines the query string for Searchkick
  def permit_project_query
    permit_project_search_params[:query].presence || "*"
  end

  # Determines the order clause for Searchkick
  def permit_project_order
    if (sort = permit_project_search_params[:sort])
      { sort[:field] => { order: sort[:direction], unmapped_type: "long" } }
    else
      # Default sort order, e.g., by creation date or a relevant project field
      { created_at: { order: :desc, unmapped_type: "long" } }
    end
  end

  # Determines the where clause for Searchkick
  def permit_project_where_clause
    filters = permit_project_search_params[:filters] || {}
    where_conditions = {}

    # Example: Add conditions based on current_user or context if needed
    # if current_user.review_staff? && @jurisdiction # Assuming @jurisdiction might be set
    #   where_conditions[:jurisdiction_id] = @jurisdiction.id # Requires jurisdiction_id to be indexed for Project
    # end

    # Apply filters from params
    # Example filter handling:
    # if filters[:status].present?
    #   where_conditions[:status] = filters[:status]
    # end
    # if filters[:jurisdiction_id].present?
    #   # This would require jurisdiction_id to be indexed for PermitProject,
    #   # likely from its primary_permit_application.search_data
    #   where_conditions[:primary_permit_application_jurisdiction_id] = filters[:jurisdiction_id]
    # end

    # Merge compact symbolic keys from filters into where_conditions
    (filters.to_h.deep_symbolize_keys.compact).merge!(where_conditions)
  end
end
