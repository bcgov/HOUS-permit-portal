class OverheatingToolPolicy < ApplicationPolicy
  def index?
    create?
  end

  def create?
    user.present?
  end

  def show?
    update?
  end

  def update?
    user.present? && record.user_id == user.id
  end

  def destroy?
    update?
  end

  def generate_pdf?
    update?
  end

  def download?
    update?
  end

  def archive?
    update?
  end

  def restore?
    update?
  end

  class Scope < Scope
    def resolve
      scope.where(user_id: user.id)
    end
  end
end
