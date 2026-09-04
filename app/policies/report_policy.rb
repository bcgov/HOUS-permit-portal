class ReportPolicy < ApplicationPolicy
  def index?
    user.super_admin?
  end

  def show?
    index?
  end

  def refresh?
    index?
  end

  def export?
    index?
  end
end
