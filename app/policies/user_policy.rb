class UserPolicy < ApplicationPolicy
  def profile?
    user.id == record.id
  end

  def update?
    user.manager? && record_in_users_jurisdictions?
  end

  def invite?
    user.super_admin? || user.manager?
  end

  def invite_reviewer?
    invite?
  end

  def index?
    user.super_admin?
  end

  def search_jurisdiction_users?
    return true if user.super_admin? && (record.review_manager? || record.regional_review_manager?)
    user.manager? && record_in_users_jurisdictions?
  end

  def search_admin_users?
    user.super_admin? && record.super_admin?
  end

  def destroy?
    search_jurisdiction_users?
  end

  def restore?
    destroy?
  end

  def accept_eula?
    profile?
  end

  def resend_confirmation?
    profile?
  end

  def record_in_users_jurisdictions?
    user.jurisdictions.pluck(:id).intersect?(record.jurisdictions.pluck(:id))
  end

  def reinvite?
    invite?
  end
  class Scope < Scope
    # NOTE: Be explicit about which records you allow access to!
    # def resolve
    #   scope.all
    # end
  end
end
