module Api::Concerns::Search::PermitProjects
  extend ActiveSupport::Concern

  # Public method to be called by the controller
  def perform_permit_project_search
    search_conditions = {
      order: permit_project_order,
      match: :word_middle, # Default match type, can be customized
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
      includes: [
        :owner,
        :jurisdiction,
        { permit_applications: :collaborators }
      ],
      load: false
    }
    @permit_project_search =
      PermitProject.search(permit_project_query, **search_conditions)
    ids = @permit_project_search.hits.map { |h| h["_id"] }
    loaded = PermitProject.with_status_counts.where(id: ids)
    @permit_projects = loaded.sort_by { |p| ids.index(p.id) }
    @meta = {
      total_pages: @permit_project_search.total_pages,
      current_page: @permit_project_search.current_page,
      total_count: @permit_project_search.total_count
    }
  end

  private

  # Strong parameters for project search
  def permit_project_search_params
    params.permit(
      :query,
      :page,
      :per_page,
      filters: [
        :show_archived,
        { jurisdiction_id: [] },
        { rollup_status: [] },
        { requirement_template_ids: [] }
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
    search_filters = (permit_project_search_params[:filters] || {}).deep_dup
    show_archived =
      ActiveModel::Type::Boolean.new.cast(
        search_filters.delete(:show_archived) || false
      )

    requirement_template_ids = search_filters.delete(:requirement_template_ids)
    if requirement_template_ids.present?
      search_filters[:requirement_template_ids] = requirement_template_ids
    end

    jurisdiction_ids = search_filters.delete(:jurisdiction_id)
    if jurisdiction_ids.present?
      search_filters[:jurisdiction_id] = jurisdiction_ids
    end

    search_filters[:discarded] = show_archived

    or_conditions = [
      { owner_id: current_user.id },
      { collaborator_ids: current_user.id }
    ]

    final_where = { _and: [{ _or: or_conditions }] }

    search_filters.each { |key, value| final_where[:_and] << { key => value } }

    final_where
  end
end
