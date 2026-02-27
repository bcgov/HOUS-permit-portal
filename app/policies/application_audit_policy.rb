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
