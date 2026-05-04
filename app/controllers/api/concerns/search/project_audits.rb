module Api::Concerns::Search::ProjectAudits
  extend ActiveSupport::Concern

  def perform_project_audit_search
    relation =
      ApplicationAudit
        .for_permit_project(@permit_project.id)
        .includes(:user, :auditable)
        .then do |scope|
          policy_scope(scope, policy_scope_class: ProjectAuditPolicy::Scope)
        end

    relation = apply_project_audit_date_filter(relation)
    relation = apply_project_audit_order(relation)
    relation = relation.page(project_audit_page).per(project_audit_per_page)

    audits = relation.to_a
    ApplicationAudit.preload_activity_feed(audits)

    @search = relation
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

  def project_audit_page
    project_audit_search_params[:page].presence || 1
  end

  def project_audit_per_page
    project_audit_search_params[:per_page].presence ||
      Kaminari.config.default_per_page
  end

  def apply_project_audit_date_filter(relation)
    search_filters =
      (
        project_audit_search_params[:filters].to_h || {}
      ).deep_symbolize_keys.compact_blank
    from = parsed_datetime(search_filters[:from])&.beginning_of_day
    to = parsed_datetime(search_filters[:to])&.end_of_day
    relation = relation.where("created_at >= ?", from) if from.present?
    relation = relation.where("created_at <= ?", to) if to.present?
    relation
  end

  def apply_project_audit_order(relation)
    sort = project_audit_search_params[:sort]
    if sort.present? && sort[:field].to_s == "created_at"
      direction = sort[:direction].to_s.downcase == "asc" ? :asc : :desc
      relation.order(created_at: direction)
    else
      relation.order(created_at: :desc)
    end
  end

  def parsed_datetime(value)
    return nil if value.blank?

    Time.zone.parse(value.to_s)
  rescue ArgumentError, TypeError
    nil
  end
end
