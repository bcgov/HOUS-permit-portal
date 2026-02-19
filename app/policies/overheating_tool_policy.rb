class OverheatingToolPolicy < ApplicationPolicy
  def index?
    user.present?
  end

  def create?
    user.present?
  end

  def show?
    user.present? && record.user_id == user.id
  end

  def update?
    show?
  end

  def destroy?
    show?
  end

  def generate_pdf?
    show?
  end

  def download?
    show?
  end

  def archive?
    show?
  end

  def restore?
    show?
  end

  class Scope < Scope
    def resolve
      scope.where(user_id: user.id)
    end
  end
end
