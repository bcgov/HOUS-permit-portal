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

      restrict_by_role(base)
    end

    private

    def restrict_by_role(relation)
      return relation if full_audit_access?

      if user.submitter?
        # Submitters see All + submission collaborations + block status (hide review collaborations)
        relation.where.not(
          auditable_type: "PermitCollaboration",
          auditable_id:
            PermitCollaboration.where(collaboration_type: :review).select(:id)
        )
      elsif user.review_staff?
        # Review staff see All + review collaborations (hide submission collaborations and block status)
        relation
          .where.not(
            auditable_type: "PermitCollaboration",
            auditable_id:
              PermitCollaboration.where(collaboration_type: :submission).select(
                :id
              )
          )
          .where.not(auditable_type: "PermitBlockStatus")
      else
        # Other roles (e.g. no matching role): only All events
        relation.where(auditable_type: %w[PermitProject PermitApplication])
      end
    end

    def full_audit_access?
      user.super_admin?
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
