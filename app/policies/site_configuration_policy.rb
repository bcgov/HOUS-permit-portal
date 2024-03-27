class SiteConfigurationPolicy < ApplicationPolicy
  def create?
    user.super_admin?
  end

  def index?
    true
  end
end
