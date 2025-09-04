class PermitClassificationPolicy < ApplicationPolicy
  def index?
    true
  end

  def permit_classification_options?
    index?
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

  class Scope < Scope
    def resolve
      scope.enabled
    end
  end
end
