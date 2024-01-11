class JurisdictionPolicy < ApplicationPolicy
  def show?
    true
  end

  def index?
    user.super_admin?
  end

  def search_users?
    user.super_admin? || (user.review_manager? && user.jurisdiciton == resource)
  end

  class Scope < Scope
    def resolve
      scope.all
    end
  end
end
