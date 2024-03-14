class PermitApplicationPolicy < ApplicationPolicy
  # All user types can use the search permit application
  def index?
    if user.super_admin?
      true
    elsif user.review_manager? || user.reviewer?
      record.jurisdiction.id == user.jurisdiction_id
    elsif user.submitter?
      record.submitter_id == user.id
    end
  end

  def show?
    index?
  end

  def create?
    user.submitter?
  end

  def update?
    record.draft? ? record.submitter == user : (user.review_manager? || user.reviewer?)
  end

  def submit?
    update?
  end

  # we may want to separate an admin update to a secondary policy

  class Scope < Scope
    def resolve
      scope.where(submitter: user)
    end
  end
end
