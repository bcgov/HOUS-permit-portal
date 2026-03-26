class ApplicationAudit < Audited::Audit
  include ActivityFeedPreloader

  scope :for_permit_project,
        ->(project_id) do
          pa_subquery =
            PermitApplication.where(permit_project_id: project_id).select(:id)
          where(
            "(auditable_type = ? AND auditable_id = ?) OR " \
              "(auditable_type = ? AND auditable_id IN (?)) OR " \
              "(associated_type = ? AND associated_id IN (?))",
            "PermitProject",
            project_id,
            "PermitApplication",
            pa_subquery,
            "PermitApplication",
            pa_subquery
          )
        end
end
