class ProjectAuditPolicy < ApplicationPolicy
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
      if user.submitter?
        # Hide:
        # - review collaborations
        relation.where.not(
          auditable_type: "PermitCollaboration",
          auditable_id:
            PermitCollaboration.where(collaboration_type: :review).select(:id)
        )
      elsif user.review_staff?
        # Hide:
        # - block status audits
        # - submission collaboration audits for non-delegatees (assignees)
        relation
          .where.not(
            auditable_type: "PermitCollaboration",
            auditable_id:
              PermitCollaboration
                .where(collaboration_type: :submission)
                .where.not(collaborator_type: :delegatee)
                .select(:id)
          )
          .where.not(auditable_type: "PermitBlockStatus")
      else
        # Hide:
        # - block status audits
        # - review collaborations
        # - submission collaborations for non-delegatees (assignees)
        relation
          .where.not(auditable_type: "PermitBlockStatus")
          .where.not(
            auditable_type: "PermitCollaboration",
            auditable_id:
              PermitCollaboration.where(collaboration_type: :review).select(:id)
          )
          .where.not(
            auditable_type: "PermitCollaboration",
            auditable_id:
              PermitCollaboration
                .where(collaboration_type: :submission)
                .where.not(collaborator_type: :delegatee)
                .select(:id)
          )
      end
    end
  end
end
