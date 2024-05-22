class SiteConfigurationPolicy < ApplicationPolicy
  def update?
    user.super_admin?
  end

  def show?
    true
  end
end
