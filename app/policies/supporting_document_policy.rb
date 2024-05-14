class SupportingDocumentPolicy < ApplicationPolicy
  def download?
    return true if record.permit_application.submitter_id == user.id
    if user.review_manager? || user.reviewer?
      record.permit_application.jurisdiction.id == user.jurisdiction_id
    else
      false
    end
  end

  def destroy?
    record.permit_application.submitter_id == user.id
  end

  def delete?
    destroy?
  end
end
