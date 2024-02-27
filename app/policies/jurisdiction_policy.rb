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
    user.super_admin? || (user.staff? && user.jurisdiction_id == record.id)
  end

  def search_users?
    update?
  end

  def search_permit_applications?
    # note that this applies to the jurisdiction, not the permit applications
    update?
  end

  class Scope < Scope
    def resolve
      scope.all
    end
  end
end
