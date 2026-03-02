# [AUDITS SUGGESTION] Fallback policy for audits whose auditable has been deleted.
# ApplicationAuditPolicy delegates to the auditable's policy, but when the
# auditable is nil (hard-deleted), we need a safe default that denies access.
class DenyAllPolicy < ApplicationPolicy
  def initialize(user_context, _record)
    super(user_context, nil)
  end

  %i[index? show? create? new? update? edit? destroy?].each do |action|
    define_method(action) { false }
  end
end
