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

  def update?
    create?
  end

  def schedule?
    create?
  end

  def destroy?
    create?
  end

  def restore?
    create?
  end

  class Scope < Scope
    def resolve
      scope.all
    end
  end
end
