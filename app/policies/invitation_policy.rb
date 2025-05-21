class InvitationPolicy < ApplicationPolicy
  def create?
    user.super_admin? || user.review_manager? ||
      user.regional_review_manager? || user.technical_support?
  end

  def remove?
    user.super_admin?
  end

  def update?
    user.review_staff? || user.technical_support?
  end

  # Add more methods as needed for other actions
end
