module AuditRoleFilter
  extend ActiveSupport::Concern

  class_methods do
    # Filters an audit relation to only include records visible to the given user's role.
    #   - Submitters: hide review collaborations
    #   - Review staff: hide block status audits, hide non-delegatee submission collaborations
    #   - Others: hide block status audits, review collaborations, non-delegatee submission collaborations
    def visible_to_role(relation, user)
      if user.submitter?
        relation.where.not(
          auditable_type: "PermitCollaboration",
          auditable_id:
            PermitCollaboration.where(collaboration_type: :review).select(:id)
        )
      elsif user.review_staff?
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
