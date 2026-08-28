class ReportPolicy < ApplicationPolicy
  def index?
    user.super_admin?
  end

  def show?
    user.super_admin?
  end

  def refresh?
    user.super_admin?
  end

  def export?
    user.super_admin?
  end
end
