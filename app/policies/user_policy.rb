class UserPolicy < ApplicationPolicy
  def update?
    user == record
  end

  def invite?
    user.super_admin? || user.review_manager?
  end

  def invite_reviewer?
    invite?
  end

  # This method is used as a scope in jurisdiciton user search
  def index?
    (user.super_admin? && record.review_manager?) ||
      (user.review_manager? && user.jurisdiciton_id == record.jurisdiction_id)
  end

  class Scope < Scope
    # NOTE: Be explicit about which records you allow access to!
    # def resolve
    #   scope.all
    # end
  end
end
