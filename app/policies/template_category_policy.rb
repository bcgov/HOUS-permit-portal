class TemplateCategoryPolicy < ApplicationPolicy
  def index?
    user&.super_admin?
  end

  def create?
    user&.super_admin?
  end

  def update?
    user&.super_admin?
  end

  def destroy?
    user&.super_admin?
  end

  def reorder?
    update?
  end

  def reorder_templates?
    update?
  end

  class Scope < Scope
    def resolve
      return scope.all if user&.super_admin?

      scope.none
    end
  end
end
