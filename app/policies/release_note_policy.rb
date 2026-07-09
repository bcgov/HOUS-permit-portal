class ReleaseNotePolicy < ApplicationPolicy
  def create?
    user.super_admin?
  end

  def update?
    user.super_admin?
  end

  def publish?
    user.super_admin?
  end

  def index?
    true
  end

  def show?
    user&.super_admin?
  end

  def viewer_context?
    record.published? || user&.super_admin?
  end

  class Scope < Scope
    def resolve
      return scope.all if user&.super_admin?

      scope.published
    end
  end
end
