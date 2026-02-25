# Search concern for querying ApplicationAudit records scoped to a single
# PermitProject. Mirrors the pattern used by ProjectPermitApplications, which
# expects @permit_project to be set by the including controller.
#
# This powers the "Activity" tab on the /project/:projectId show page.
# Because ApplicationAudit indexes a resolved `permit_project_id` in its
# search_data (see ApplicationAudit#permit_project_id_for_search), a single
# Searchkick query returns the unified feed: audits on the project itself
# AND audits on any child record that declared `associated_with: :permit_project`
# (e.g. PermitApplication, StepCode, PreCheck).
#
# The frontend can use this to render a searchable, paginated, filterable
# activity grid — same UX pattern as the permit applications grid, but for
# audit history across the entire project.
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
            (
              project_audit_search_params[:per_page] ||
                Kaminari.config.default_per_page
            )
          else
            nil
          end
        )
    }

    @project_audit_search =
      ApplicationAudit.search(project_audit_query, **search_conditions)
  end

  private

  def project_audit_search_params
    params.permit(
      :query,
      :page,
      :per_page,
      filters: %i[auditable_type action user_id],
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

    # Core scope: only audits belonging to this project (direct or associated).
    and_conditions << { permit_project_id: @permit_project.id }

    search_filters.each do |key, value|
      case key
      when :auditable_type
        # Filter to a specific record type, e.g. "PermitApplication" only
        and_conditions << { auditable_type: value }
      when :action
        # Filter by audit action: "create", "update", "destroy"
        and_conditions << { action: value }
      when :user_id
        and_conditions << { user_id: value }
      else
        and_conditions << { key => value }
      end
    end

    { _and: and_conditions }
  end
end
