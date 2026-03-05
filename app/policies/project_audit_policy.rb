class ProjectAuditPolicy < ApplicationPolicy
  delegate :index?, :show?, to: :auditable_policy

  class Scope < Scope
    def resolve
      accessible_project_ids =
        Pundit.policy_scope!(
          UserContext.new(user, sandbox),
          PermitProject
        ).select(:id)

      # Permit applications that belong to accessible projects (for audits on
      # PermitBlockStatus, PermitCollaboration, etc. that use associated_with: :permit_application)
      accessible_pa_ids =
        PermitApplication.where(
          permit_project_id: accessible_project_ids
        ).select(:id)

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
    end
  end

  private

  def auditable_policy
    @auditable_policy ||=
      if record.auditable.nil?
        DenyAllPolicy.new(user_context, nil)
      else
        Pundit.policy!(user_context, record.auditable)
      end
  end
end
