# Jurisdiction staff access. Delegates to the jurisdiction checks on User.
class JurisdictionAccess
  def initialize(user, jurisdiction)
    @user = user
    @jurisdiction_id =
      jurisdiction.respond_to?(:id) ? jurisdiction.id : jurisdiction
  end

  def member?
    @user.present? && @jurisdiction_id.present? &&
      @user.member_of?(@jurisdiction_id)
  end

  def review_staff?
    member? && @user.review_staff?
  end

  def manager?
    member? && @user.manager?
  end
end
