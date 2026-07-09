class OverheatingCodePolicy < ApplicationPolicy
  def index?
    overheating_tool_enabled? && user.present?
  end

  def show?
    overheating_tool_enabled? && record.creator_id == user.id
  end

  def create?
    overheating_tool_enabled? && user.present?
  end

  def update?
    show?
  end

  def destroy?
    show?
  end

  def restore?
    show?
  end

  private

  def overheating_tool_enabled?
    SiteConfiguration.overheating_tool_enabled?
  end

  class Scope < Scope
    def resolve
      return scope.none unless SiteConfiguration.overheating_tool_enabled?

      scope.where(creator_id: user.id)
    end
  end
end
