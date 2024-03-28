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
    (user.super_admin? && record.review_manager?) ||
      (user.review_manager? && user.jurisdiction_id == record.jurisdiction_id)
  end

  def search_users?
    index?
  end

  def destroy?
    index?
  end

  def restore?
    index?
  end

  def accept_eula?
    record.id == user.id
  end

  class Scope < Scope
    # NOTE: Be explicit about which records you allow access to!
    # def resolve
    #   scope.all
    # end
  end
end
