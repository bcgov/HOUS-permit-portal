class SupportingDocumentPolicy < ApplicationPolicy
  def download?
    return true if record.permit_application.submitter_id == user.id
    if user.review_staff?
      user.jurisdictions.find(record.permit_application.jurisdiction.id)
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
