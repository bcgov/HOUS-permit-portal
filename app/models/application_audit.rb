class ApplicationAudit < Audited::Audit
  include ActivityFeedPreloader
  include AuditRoleFilter

  # Hide read/unread noise when viewed_at was refreshed but stayed "read".
  REDUNDANT_VIEWED_AT_TRANSITION_SQL = <<~SQL.squish
    auditable_type IN ('PermitProject', 'SubmissionVersion')
    AND audited_changes ? 'viewed_at'
    AND NULLIF(audited_changes #>> '{viewed_at,0}', '') IS NOT NULL
    AND NULLIF(audited_changes #>> '{viewed_at,1}', '') IS NOT NULL
  SQL

  scope :excluding_redundant_viewed_at_audits,
        -> { where.not(REDUNDANT_VIEWED_AT_TRANSITION_SQL) }

  scope :for_permit_project,
        ->(project_id) do
          pa_subquery =
            PermitApplication.where(permit_project_id: project_id).select(:id)
          excluding_redundant_viewed_at_audits.where(
            "(auditable_type = ? AND auditable_id = ?) OR " \
              "(auditable_type = ? AND auditable_id IN (?)) OR " \
              "(associated_type = ? AND associated_id IN (?)) OR " \
              "(associated_type = ? AND associated_id = ?)",
            "PermitProject",
            project_id,
            "PermitApplication",
            pa_subquery,
            "PermitApplication",
            pa_subquery,
            "PermitProject",
            project_id
          )
        end
end
