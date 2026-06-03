class JurisdictionPolicy < ApplicationPolicy
  def show?
    true
  end

  def locality_type_options?
    true
  end

  def index?
    show?
  end

  def jurisdiction_options?
    index?
  end

  def create?
    user.super_admin?
  end

  def update?
    user.super_admin? ||
      ((user.manager? || user.technical_support?) && user.member_of?(record.id))
  end

  def update_external_api_enabled?
    update? && (user.super_admin? || !record.g_off?)
  end

  def search_users?
    update?
  end

  def search_permit_applications?
    user.review_staff? && user.member_of?(record.id)
  end

  def search_permit_projects?
    # note that this applies to the jurisdiction, not the permit projects
    search_permit_applications?
  end

  class Scope < Scope
    def resolve
      scope.all
    end
  end
end
