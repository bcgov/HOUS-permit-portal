class RequirementTemplatePolicy < ApplicationPolicy
  def index?
    user.super_admin? || user.review_manager?
  end

  class Scope < Scope
    def resolve
      scope.all
    end
  end
end
