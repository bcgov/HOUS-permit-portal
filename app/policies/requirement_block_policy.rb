class RequirementBlockPolicy < ApplicationPolicy
  # TODO: expand roles that can access requirements when defined
  def show?
    user.super_admin?
  end

  def create?
    user.super_admin?
  end

  def update?
    create?
  end

  def destroy?
    create?
  end

  class Scope < Scope
    def resolve
      user.super_admin? ? RequirementBlock.all : []
    end
  end
end
