class ExplainerPolicy < ApplicationPolicy
  def show?
    user&.super_admin?
  end

  def update?
    show?
  end
end
