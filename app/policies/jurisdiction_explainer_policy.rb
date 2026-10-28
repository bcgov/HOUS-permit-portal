class JurisdictionExplainerPolicy < ApplicationPolicy
  def show?
    return true if user&.super_admin?

    explainer_published?
  end

  def update?
    can_manage_settings? && explainer_published?
  end

  private

  def can_manage_settings?
    (user&.review_manager? || user&.regional_review_manager?) &&
      user.member_of?(record.jurisdiction_id)
  end

  def explainer_published?
    record.requirement_template.explainer&.published?
  end
end
