class PermitApplicationPolicy < ApplicationPolicy
  def create?
    user.submitter?
  end

  def update?
    record.submitter == user
  end

  #we may want to separate an admin update to a secondary policy

  class Scope < Scope
    def resolve
      if user.super_admin?
        scope.all
      elsif user.review_manager? || user.reviewer?
        scope.where(jurisdiction: user.jurisdiction)
      elsif user.submitter?
        scope.where(submitter: user)
      end
    end
  end
end
