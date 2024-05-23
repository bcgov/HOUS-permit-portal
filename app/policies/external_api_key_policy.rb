class ExternalApiKeyPolicy < ApplicationPolicy
  def index?
    user.super_admin? || user.review_manager? || user.regional_review_manager?
  end

  def show?
    return true if user.super_admin?
    (user.review_manager? || user.regional_review_manager?) && record.jurisdiction.external_api_enabled? &&
      user.jurisdictions.find(record.jurisdiction_id).present?
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
      raise Pundit::NotAuthorizedError unless user.super_admin? || user.review_manager? || user.regional_review_manager?

      user.super_admin? ? ExternalApiKey.all : ExternalApiKey.where(jurisdiction_id: user.jurisdictions.pluck(:id))
    end
  end
end
