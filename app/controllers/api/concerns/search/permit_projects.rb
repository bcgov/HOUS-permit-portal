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
        # Add other filters that PermitApplication search uses, like :has_collaborator
        :jurisdiction_id,
        { status: [] },
        :has_collaborator
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
    filters = permit_project_search_params[:filters] || {}

    # Handle :has_collaborator filter like in PermitApplication
    if filters.key?(:has_collaborator) && filters[:has_collaborator] == false
      filters[:has_collaborator] = nil # Or remove the key if Searchkick handles nil as no filter
    end

    where_conditions =
      if @jurisdiction # Assuming @jurisdiction might be set for specific views
        {
          jurisdiction_id: @jurisdiction.id,
          # Overrides status filter if @jurisdiction is set, mirroring PA behavior
          status: %i[newly_submitted resubmitted]
        }
      else
        # Default for general user views, ensures user has edit permissions on primary app
        { user_ids_with_submission_edit_permissions: current_user.id }
      end

    # Add sandbox_id filter if applicable, mirroring PA behavior
    where_conditions[:sandbox_id] = current_sandbox&.id if defined?(
      current_sandbox
    ) && current_sandbox && !current_user.super_admin?

    (filters.to_h.deep_symbolize_keys.compact).merge!(where_conditions)
  end
end
