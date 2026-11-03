module Api::Concerns::Search::ProjectMemberships
  extend ActiveSupport::Concern

  def perform_project_membership_search
    @include_project_owner = owner_matches_search?
    window = membership_window

    # Page 1 keeps a row for the owner, who is not a membership document.
    # A full page of only the owner still runs the membership query so the hit count stays correct.
    @drop_membership_results = window[:drop_results]
    @project_membership_search =
      ProjectMembership.search(
        people_query,
        where: membership_where,
        match: :word_start,
        fields: [{ name: :word_start }],
        order: {
          created_at: {
            order: :asc,
            unmapped_type: "long"
          }
        },
        limit: [window[:limit], 1].max,
        offset: window[:offset],
        includes: [:user]
      )
  end

  def include_project_owner?
    @include_project_owner
  end

  def project_people_rows
    rows = []
    if @include_project_owner && people_page == 1 &&
         (owner = @permit_project.owner)
      rows << {
        id: "owner-#{owner.id}",
        kind: "owner",
        name: owner.name,
        email: owner.email,
        role_tags: [],
        access: nil,
        contact_designation: "none"
      }
    end
    return rows if @drop_membership_results

    @project_membership_search.results.each do |membership|
      rows << {
        id: membership.id,
        kind: "member",
        name: membership.user.name,
        email: membership.user.email,
        role_tags: membership.role_list.to_a,
        access: membership.access,
        contact_designation: membership.contact_designation
      }
    end
    rows
  end

  def project_people_meta
    per_page = people_per_page
    total = @project_membership_search.total_count
    total += 1 if @include_project_owner
    {
      total_pages: per_page.positive? ? (total.to_f / per_page).ceil : 0,
      total_count: total,
      current_page: people_page,
      per_page: per_page,
      role_tags: project_role_tags
    }
  end

  private

  def project_membership_search_params
    params.permit(
      :query,
      :page,
      :per_page,
      filters: {
        access: [],
        role_tags: []
      }
    )
  end

  def people_query
    project_membership_search_params[:query].presence || "*"
  end

  def people_page
    page = project_membership_search_params[:page].presence || 1
    [page.to_i, 1].max
  end

  def people_per_page
    raw =
      project_membership_search_params[:per_page].presence ||
        Kaminari.config.default_per_page
    size = raw.to_i
    size.positive? ? size : Kaminari.config.default_per_page
  end

  def membership_filters
    raw = project_membership_search_params[:filters]
    return {} if raw.blank?

    raw.to_h.deep_symbolize_keys.compact_blank
  end

  def membership_where
    where = { permit_project_id: @permit_project.id }
    filters = membership_filters
    where[:access] = filters[:access] if filters[:access].present?
    where[:role_tags] = filters[:role_tags] if filters[:role_tags].present?
    where
  end

  def membership_window
    page = people_page
    per_page = people_per_page
    unless @include_project_owner
      return(
        { limit: per_page, offset: (page - 1) * per_page, drop_results: false }
      )
    end

    if page == 1
      limit = per_page - 1
      { limit: limit, offset: 0, drop_results: limit <= 0 }
    else
      {
        limit: per_page,
        offset: (page - 1) * per_page - 1,
        drop_results: false
      }
    end
  end

  def owner_matches_search?
    return false if @permit_project.owner_id.blank?
    filters = membership_filters
    return false if filters[:access].present? || filters[:role_tags].present?

    User
      .search(
        people_query,
        where: {
          id: @permit_project.owner_id
        },
        fields: %i[first_name last_name],
        match: :word_start,
        limit: 1,
        load: false
      )
      .total_count
      .positive?
  end

  def project_role_tags
    ProjectMembership
      .where(permit_project_id: @permit_project.id)
      .flat_map { |membership| membership.role_list.to_a }
      .uniq
      .sort
  end
end
