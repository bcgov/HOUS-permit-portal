class RequirementTemplatePolicy < ApplicationPolicy
  def index?
    user.super_admin? || user.review_manager?
  end

  def show?
    index?
  end

  def create?
    user.super_admin?
  end

  class Scope < Scope
    def resolve
      scope.all
    end
  end
end
