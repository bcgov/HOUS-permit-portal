class HelpVideoSectionPolicy < ApplicationPolicy
  def index?
    true
  end

  def show?
    true
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
      return scope.all if user&.super_admin?

      scope.with_published_videos
    end
  end
end
