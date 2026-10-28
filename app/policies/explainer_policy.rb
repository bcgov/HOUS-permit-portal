class ExplainerPolicy < ApplicationPolicy
  def show?
    return true if user&.super_admin?

    user&.manager?
  end

  def update?
    user&.super_admin?
  end
end
