# Authorization questions for the signed-in user, in three slices:
# account role, jurisdiction, and project membership. Policies call these
# instead of repeating the predicates.
class Access
  def initialize(user_context)
    @user = user_context.user
    @sandbox = user_context.sandbox
  end

  def account
    AccountAccess.new(@user)
  end

  def in(jurisdiction)
    JurisdictionAccess.new(@user, jurisdiction)
  end

  def on(project)
    ProjectAccess.new(@user, @sandbox, project)
  end
end
