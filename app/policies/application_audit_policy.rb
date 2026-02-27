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
