class PermitApplicationPolicy < ApplicationPolicy
  # Currently the real index endpoint is only set up for use by submitters for obtaining ones OWN permit applications
  def index?
    record.submitter_id == user.id
  end

  # All user types can use the search permit application
  # but the actual endpoint requires that a @jurisdiction is set using the path param
  # Such routes are intended for reviewers/managers/admins
  def search_permit_applications?
    if user.super_admin?
      true
    elsif user.review_manager? || user.reviewer?
      record.jurisdiction.id == user.jurisdiction_id
    elsif user.submitter?
      record.submitter_id == user.id
    end
  end

  def create?
    user.submitter?
  end

  def update?
    record.submitter == user
  end

  #we may want to separate an admin update to a secondary policy

  class Scope < Scope
    def resolve
      scope.where(submitter: user)
    end
  end
end
