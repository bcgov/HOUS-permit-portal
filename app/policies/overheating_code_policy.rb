class OverheatingCodePolicy < ApplicationPolicy
  def index?
    user.present?
  end

  def show?
    record.creator_id == user.id
  end

  def create?
    user.present?
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

  class Scope < Scope
    def resolve
      scope.where(creator_id: user.id)
    end
  end
end
