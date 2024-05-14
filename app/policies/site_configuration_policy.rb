class SiteConfigurationPolicy < ApplicationPolicy
  def create?
    user.super_admin?
  end

  def show?
    true
  end
end
