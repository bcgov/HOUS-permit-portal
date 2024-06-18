class UserPolicy < ApplicationPolicy
  def profile?
    user.id == record.id
  end

  def update?
    (user.review_manager? && user.jurisdiction_id == record.jurisdiction_id)
  end

  def invite?
    user.super_admin? || user.review_manager?
  end

  def invite_reviewer?
    invite?
  end

  def index?
    user.super_admin?
  end

  def search_jurisdiction_users?
    (user.super_admin? && record.review_manager?) ||
      (user.review_manager? && user.jurisdiction_id == record.jurisdiction_id)
  end

  def search_admin_users?
    user.super_admin? && record.super_admin?
  end

  def destroy?
    search_jurisdiction_users? || user.super_admin?
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
