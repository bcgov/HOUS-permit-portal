class PermitApplicationPolicy < ApplicationPolicy
  def create
    user.submitter?
  end

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
