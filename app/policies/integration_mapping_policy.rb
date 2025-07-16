class IntegrationMappingPolicy < ApplicationPolicy
  def update?
    (
      (user.review_manager? || user.regional_review_manager?) &&
        record.jurisdiction.external_api_enabled? &&
        user.member_of?(record.jurisdiction_id)
    )
  end
end
