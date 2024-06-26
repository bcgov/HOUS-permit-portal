class PermitApplicationPolicy < ApplicationPolicy
  # All user types can use the search permit application
  def index?
    if user.super_admin? || record.submitter == user
      true
    elsif user.review_staff?
      user.jurisdictions.find(record.jurisdiction.id).present? && record.submitted?
    end
  end

  def show?
    index?
  end

  def create?
    true
  end

  def mark_as_viewed?
    user.review_staff?
  end

  def update?
    record.draft? ? record.submitter == user : user.review_staff?
  end

  def update_version?
    update?
  end

  def upload_supporting_document?
    record.draft? && record.submitter == user
  end

  def submit?
    update?
  end

  def generate_missing_pdfs?
    user.super_admin? || (user.submitter? && record.submitter == user) ||
      ((user.review_staff?) && user.jurisdictions.find(record.jurisdiction_id))
  end

  # we may want to separate an admin update to a secondary policy

  class Scope < Scope
    def resolve
      scope.where(submitter: user)
    end
  end
end
