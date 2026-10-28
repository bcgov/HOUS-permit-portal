class ExplainerPolicy < ApplicationPolicy
  def show?
    return true if user&.super_admin?
    return false if record.requirement_template&.discarded?
    return true if record.published?

    !!user&.manager?
  end

  def update?
    user&.super_admin?
  end
end
