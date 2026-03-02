module Api::Concerns::Search::ProjectAudits
  extend ActiveSupport::Concern

  def perform_project_audit_search
    search_conditions = {
      order: project_audit_order,
      match: :word_start,
      fields: [
        { omniauth_username: :word_start },
        { permit_application_nickname: :word_middle },
        { jurisdiction_name: :text_start }
      ],
      where: project_audit_where_clause,
      page: project_audit_search_params[:page],
      per_page:
        (
          if project_audit_search_params[:page]
            project_audit_search_params[:per_page] ||
              Kaminari.config.default_per_page
          end
        ),
      # [AUDITS SUGGESTION] Use scope_results with policy_scope instead of
      # per-record apply_search_authorization in the controller. This runs a
      # single AR-level scope (see ApplicationAuditPolicy::Scope) instead of
      # N+1 policy checks, and also satisfies Pundit's verify_policy_scoped.
      scope_results: ->(relation) { policy_scope(relation) }
    }

    @search = ApplicationAudit.search(project_audit_query, **search_conditions)
  end

  private

  def project_audit_search_params
    params.permit(
      :query,
      :page,
      :per_page,
      filters: %i[jurisdiction_name permit_application_name username],
      sort: %i[field direction]
    )
  end

  def project_audit_query
    if project_audit_search_params[:query].present?
      project_audit_search_params[:query]
    else
      "*"
    end
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

    search_filters.each do |key, value|
      condition =
        case key
        when :jurisdiction_name
          { jurisdiction_name: value }
        when :permit_application_name
          { permit_application_nickname: value }
        when :username
          { omniauth_username: value }
        end
      and_conditions << condition if condition
    end

    { _and: and_conditions }
  end
end
