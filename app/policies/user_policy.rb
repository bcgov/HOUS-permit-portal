class UserPolicy < ApplicationPolicy
  def update?
    user == record
  end

  def invite?
    user.super_admin? || user.review_manager?
  end

  def invite_reviewer?
  end

  class Scope < Scope
    # NOTE: Be explicit about which records you allow access to!
    # def resolve
    #   scope.all
    # end
  end
end
