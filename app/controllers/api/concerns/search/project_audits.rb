module Api::Concerns::Search::ProjectAudits
  extend ActiveSupport::Concern

  def perform_project_audit_search
    search_conditions = {
      order: project_audit_order,
      where: project_audit_where_clause,
      page: project_audit_search_params[:page],
      per_page:
        (
          if project_audit_search_params[:page]
            project_audit_search_params[:per_page] ||
              Kaminari.config.default_per_page
          end
        ),
      scope_results: ->(relation) do
        policy_scope(relation, policy_scope_class: ProjectAuditPolicy::Scope)
      end
    }

    @search = ApplicationAudit.search("*", **search_conditions)
  end

  private

  def project_audit_search_params
    params.permit(
      :page,
      :per_page,
      filters: %i[to from],
      sort: %i[field direction]
    )
  end

  def project_audit_order
    if (sort = project_audit_search_params[:sort])
      { sort[:field] => { order: sort[:direction], unmapped_type: "long" } }
    else
      { created_at: { order: :desc, unmapped_type: "long" } }
    end
  end

  # Scopes every query to the current project. Unlike the PermitApplications
  # concern where @jurisdiction is conditional, here @permit_project is always
  # required — there's no meaningful "unscoped" audit search at this level.
  def project_audit_where_clause
    search_filters =
      (
        project_audit_search_params[:filters].to_h || {}
      ).deep_symbolize_keys.compact_blank

    and_conditions = []

    and_conditions << { permit_project_id: @permit_project.id }

    date_range = {}
    parsed_from = parsed_datetime(search_filters[:from])
    parsed_to = parsed_datetime(search_filters[:to])
    date_range[:gte] = parsed_from if parsed_from
    date_range[:lte] = parsed_to if parsed_to
    and_conditions << { created_at: date_range } if date_range.present?

    { _and: and_conditions }
  end

  def parsed_datetime(value)
    return nil if value.blank?

    Time.zone.parse(value.to_s)
  rescue ArgumentError, TypeError
    nil
  end
end
