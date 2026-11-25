class RequirementQuestionPolicy < ApplicationPolicy
  def show?
    user.super_admin?
  end

  def index?
    show?
  end

  def create?
    show?
  end

  def update?
    show?
  end

  def destroy?
    create?
  end

  def restore?
    destroy?
  end

  class Scope < Scope
    def resolve
      user&.super_admin? ? scope.all : scope.none
    end
  end
end
