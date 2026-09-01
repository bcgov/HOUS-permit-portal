class InfoDocumentPolicy < ApplicationPolicy
  def index?
    true
  end

  def show?
    record.published? || user&.super_admin?
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

  def publish?
    update?
  end

  def unpublish?
    update?
  end

  def reorder?
    update?
  end

  def download?
    show?
  end

  class Scope < Scope
    def resolve
      return scope.all if user&.super_admin?

      scope.published
    end
  end
end
