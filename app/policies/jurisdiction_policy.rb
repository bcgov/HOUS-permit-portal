class JurisdictionPolicy < ApplicationPolicy
  def users?
    user.super_admin? || (user.review_manager? && user.jurisdiciton == resource)
  end

  class Scope < Scope
    def resolve
      scope.all
    end
  end
end
