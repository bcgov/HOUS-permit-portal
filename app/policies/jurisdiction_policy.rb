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

  def create?
    user.super_admin?
  end

  def update?
    user.super_admin? || (user.review_manager? && user.jurisdiction_id == record.id)
  end

  def search_users?
    update?
  end

  def search_permit_applications?
    update?
  end

  class Scope < Scope
    def resolve
      scope.all
    end
  end
end
