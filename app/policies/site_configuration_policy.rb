class SiteConfigurationPolicy < ApplicationPolicy
  def update?
    user.super_admin?
  end

  def update_jurisdiction_enrollments?
    user.super_admin?
  end

  def show?
    true
  end

  def jurisdiction_enrollments?
    show?
  end
end
