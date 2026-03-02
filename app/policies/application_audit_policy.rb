class ApplicationAuditPolicy < ApplicationPolicy
  # Delegate all policy checks to the auditable's policy. If the auditable
  # was deleted (record.auditable is nil), the user is not allowed.
  delegate :index?,
           :show?,
           :create?,
           :new?,
           :update?,
           :edit?,
           :destroy?,
           to: :auditable_policy

  # [AUDITS SUGGESTION] AR-level scope so scope_results / policy_scope can
  # filter audits in a single query instead of N+1 per-record checks.
  # Delegates to PermitProjectPolicy::Scope — if you can see the project,
  # you can see its activity feed.
  #
  # ── COLLABORATOR VISIBILITY QUESTIONS ──
  #
  # This scope grants access to ALL audits under a project if the user can
  # see the project at all. But collaborators have varying levels of access:
  #
  #   - A "delegatee" (collaborator_type: :delegatee) has full access to a
  #     permit application — seeing all audits for that PA is fine.
  #
  #   - An "assignee" (collaborator_type: :assignee) is scoped to specific
  #     requirement blocks via assigned_requirement_block_id. They normally
  #     can't see form_json, submission_data, or supporting_documents for
  #     blocks outside their assignment (enforced by FormJsonService,
  #     SubmissionDataService, and the blueprint layer).
  #
  # Questions to consider:
  #
  #   Q1: Should an assignee collaborator on Permit App A see audits for
  #       Permit App B under the same project (which they have NO access to)?
  #       Currently they would, because this scope only checks project access.
  #
  #   Q2: For PermitBlockStatus and PermitCollaboration audits that reference
  #       a specific requirement_block_id — should those be filtered out if
  #       the viewer is an assignee who isn't assigned to that block?
  #
  #   Q3: If we do filter, should it happen here (SQL-level scope), in the
  #       presenter (omit from output), or both? The presenter already has
  #       the viewer — it could redact descriptions or skip entries. But
  #       SQL-level filtering would prevent data from ever reaching the
  #       response, which is safer.
  #
  #   Q4: PermitProjectPolicy::Scope joins on collaborators — so a user who
  #       collaborates on ANY permit app under a project can see the project.
  #       Is that the right level of access for the activity feed, or should
  #       we scope more tightly per permit_application_id?
  #
  class Scope < ApplicationPolicy::Scope
    def resolve
      accessible_project_ids =
        Pundit.policy_scope!(
          UserContext.new(user, sandbox),
          PermitProject
        ).select(:id)

      scope.where(
        auditable_type: "PermitProject",
        auditable_id: accessible_project_ids
      ).or(
        scope.where(
          associated_type: "PermitProject",
          associated_id: accessible_project_ids
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
