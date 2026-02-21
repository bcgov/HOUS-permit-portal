class ExternalApiKeyPolicy < ApplicationPolicy
  def index?
    user.super_admin? || user.jurisdiction_staff?
  end

  def show?
    return true if user.super_admin?
    user.jurisdiction_staff? && record.jurisdiction.external_api_enabled? &&
      user.member_of?(record.jurisdiction_id)
  end

  def create?
    show?
  end

  def update?
    create?
  end

  def destroy?
    create?
  end

  def revoke?
    create?
  end

  class Scope < Scope
    def resolve
      unless user.super_admin? || user.jurisdiction_staff?
        raise Pundit::NotAuthorizedError
      end

      if user.super_admin?
        ExternalApiKey.all
      else
        ExternalApiKey.where(jurisdiction_id: user.jurisdictions.pluck(:id))
      end
    end
  end
end
