class OverheatingCodePolicy < ApplicationPolicy
  def index?
    overheating_tool_enabled? && user.present?
  end

  def show?
    overheating_tool_enabled? && record.creator_id == user.id && same_sandbox?
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

  def same_sandbox?
    return true if user&.super_admin?

    record.sandbox_id == sandbox&.id
  end

  class Scope < Scope
    def resolve
      return scope.none unless SiteConfiguration.overheating_tool_enabled?

      relation = scope.where(creator_id: user.id)
      return relation if user.super_admin?

      relation.where(sandbox_id: sandbox&.id)
    end
  end
end
