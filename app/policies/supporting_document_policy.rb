class SupportingDocumentPolicy < ApplicationPolicy
  def download?
    return true if record.permit_application.submitter_id == user.id
    user.review_staff? ? user.jurisdictions.find(record.permit_application.jurisdiction.id) : false
  end

  def destroy?
    record.permit_application.submitter_id == user.id
  end

  def delete?
    destroy?
  end
end
