class PermitApplicationPolicy < ApplicationPolicy
  # All user types can use the search permit application
  def index?
    if user.super_admin? || record.submitter == user ||
         record.collaborator?(user_id: user.id, collaboration_type: :submission)
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
    if record.draft?
      record.submission_requirement_block_edit_permissions(user_id: user.id).present?
    else
      user.review_staff? && user.jurisdictions.find(record.jurisdiction_id)
    end
  end

  def update_version?
    record.draft? ? record.submitter == user : user.review_staff?
  end

  def update_revision_requests?
    record.submitted? && user.review_staff?
  end

  def upload_supporting_document?
    record.draft? && record.submitter == user
  end

  def submit?
    record.draft? ? record.submitter == user : user.review_staff?
    if record.draft?
      record.submission_requirement_block_edit_permissions(user_id: user.id) == :all
    else
      user.review_staff? && user.jurisdictions.find(record.jurisdiction_id)
    end
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

  def remove_collaborator_collaborations?
    permit_application = record

    if permit_application.draft?
      permit_application.submitter_id == user.id
    else
      user.review_staff? && user.jurisdictions.find(permit_application.jurisdiction_id)
    end
  end

  def invite_new_collaborator?
    create_permit_collaboration?
  end

  # we may want to separate an admin update to a secondary policy

  class Scope < Scope
    def resolve
      scope.where(submitter: user)
    end
  end
end
