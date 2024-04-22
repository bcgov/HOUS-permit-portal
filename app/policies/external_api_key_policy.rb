class ExternalApiKeyPolicy < ApplicationPolicy
  def index?
    user.super_admin? || user.review_manager?
  end

  def show?
    user.super_admin? ||
      (
        user.review_manager? && record.jurisdiction.external_api_enabled? &&
          user.jurisdiction_id == record.jurisdiction_id
      )
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
      return [] unless user.super_admin? || user.review_manager?

      user.super_admin? ? ExternalApiKey.all : ExternalApiKey.where(jurisdiction_id: user.jurisdiction_id)
    end
  end
end
