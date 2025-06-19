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
        { description: :word_middle }
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
        )
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
        # Add other filters that PermitApplication search uses, like :has_collaborator
        :jurisdiction_id,
        { status: [] },
        :show_archived
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

  # Determines the where clause for Searchkick, mirroring PermitApplication logic
  def permit_project_where_clause
    filters = (permit_project_search_params[:filters] || {}).deep_dup
    show_archived =
      ActiveModel::Type::Boolean.new.cast(filters.delete(:show_archived))

    filters.merge(owner_id: current_user.id, discarded: show_archived)
  end
end
