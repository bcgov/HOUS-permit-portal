class PermitApplicationPolicy < ApplicationPolicy
  # All user types can use the search permit application
  def index?
    if user.super_admin? || record.submitter == user
      true
    elsif user.review_staff?
      user.jurisdictions.find(record.jurisdiction.id).present? && !record.draft?
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

  def update_revision_requests?
    record.submitted? && user.review_staff?
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

  def finalize_revision_requests?
    user.review_staff? && record.submitted?
  end

  def create_permit_collaboration?
    permit_collaboration = record

    if permit_collaboration.submission?
      permit_collaboration.permit_application.submitter == user
    elsif permit_collaboration.review?
      (user.review_staff?) &&
        user.jurisdictions.find_by(id: permit_collaboration.permit_application.jurisdiction_id).present?
    else
      false
    end
  end

  # we may want to separate an admin update to a secondary policy

  class Scope < Scope
    def resolve
      scope.where(submitter: user)
    end
  end
end
