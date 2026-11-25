class ProjectAuditPolicy < ApplicationPolicy
  class Scope < Scope
    # Full and Expanded see every row on the project, including its
    # applications, so no row needs a narrower check here.
    def resolve
      activity_sql = ProjectAccess.member_sql(:view_activity?)
      values = { uid: user.id }
      if user.review_staff?
        activity_sql =
          "(#{activity_sql}) OR permit_projects.jurisdiction_id IN (:jur_ids)"
        values[:jur_ids] = user.jurisdictions.pluck(:id)
      end

      accessible_project_ids =
        Pundit
          .policy_scope!(UserContext.new(user, sandbox), PermitProject)
          .where(activity_sql, values)
          .select(:id)

      # Permit applications that belong to accessible projects (for audits on
      # PermitBlockStatus, PermitCollaboration, etc. that use associated_with: :permit_application)
      accessible_pa_ids =
        PermitApplication.where(
          permit_project_id: accessible_project_ids
        ).select(:id)

      base =
        scope
          .where(
            auditable_type: "PermitProject",
            auditable_id: accessible_project_ids
          )
          .or(
            scope.where(
              associated_type: "PermitProject",
              associated_id: accessible_project_ids
            )
          )
          .or(
            scope.where(
              associated_type: "PermitApplication",
              associated_id: accessible_pa_ids
            )
          )

      ApplicationAudit.visible_to_role(base, user)
    end
  end
end
