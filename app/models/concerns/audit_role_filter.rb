module AuditRoleFilter
  extend ActiveSupport::Concern

  # Reviewer-only activity types (submitters retain access to the feed but not these rows).
  SUBMITTER_HIDDEN_AUDITABLE_TYPES = %w[
    PermitProjectCollaboration
    SubmissionVersion
  ].freeze

  SUBMITTER_HIDDEN_PERMIT_PROJECT_CHANGES = <<~SQL.squish
    auditable_type = 'PermitProject'
    AND action = 'update'
    AND (audited_changes ? 'state' OR audited_changes ? 'viewed_at')
  SQL

  class_methods do
    # Filters an audit relation to only include records visible to the given user's role.
    #   - Submitters: hide review collaborations and reviewer-only project *updates*
    #     (state, read/unread marks), plus project reviewer / application read-unread audits
    #   - Review staff: hide block status audits, hide non-delegatee submission collaborations
    #   - Others: hide block status audits, review collaborations, non-delegatee submission collaborations
    def visible_to_role(relation, user)
      if user.submitter?
        relation
          .where.not(
            auditable_type: "PermitCollaboration",
            auditable_id:
              PermitCollaboration.where(collaboration_type: :review).select(:id)
          )
          .where.not(auditable_type: SUBMITTER_HIDDEN_AUDITABLE_TYPES)
          .where.not(SUBMITTER_HIDDEN_PERMIT_PROJECT_CHANGES)
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
