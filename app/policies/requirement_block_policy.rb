class RequirementBlockPolicy < ApplicationPolicy
  # TODO: expand roles that can access requirements when defined
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

  def auto_compliance_module_options?
    show?
  end

  class Scope < Scope
    def resolve
      user.super_admin? ? RequirementBlock.all : []
    end
  end
end
