class SubmissionContactPolicy < ApplicationPolicy
  def index?
    true
  end

  def confirm?
    true
  end

  def create?
    user&.super_admin? || user&.review_manager? ||
      user&.regional_review_manager?
  end

  def update?
    create?
  end

  def destroy?
    create?
  end

  class Scope < Scope
    def resolve
      SubmissionContact.all
    end
  end
end
