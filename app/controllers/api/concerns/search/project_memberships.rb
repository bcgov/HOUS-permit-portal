module Api::Concerns::Search::ProjectMemberships
  extend ActiveSupport::Concern

  def perform_project_membership_search
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
        page: people_page,
        per_page: people_per_page,
        includes: [:user]
      )
  end

  def project_people_rows
    @project_membership_search.results.map do |membership|
      {
        id: membership.id,
        user_id: membership.user_id,
        kind: "member",
        name: membership.user.name,
        email: membership.user.email,
        role_tags: membership.role_list.to_a,
        access: membership.access,
        contact_designation: membership.contact_designation
      }
    end
  end

  def project_people_meta
    {
      total_pages: @project_membership_search.total_pages,
      total_count: @project_membership_search.total_count,
      current_page: @project_membership_search.current_page,
      per_page: @project_membership_search.limit_value,
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

  def project_role_tags
    ProjectMembership
      .where(permit_project_id: @permit_project.id)
      .flat_map { |membership| membership.role_list.to_a }
      .uniq
      .sort
  end
end
