class SupportingDocumentPolicy < ApplicationPolicy
  def download?
    return true if record.permit_application.submitter_id == user.id
    return false unless user.review_staff?

    user
      .jurisdictions
      .find_by(id: record.permit_application.jurisdiction.id)
      .present?
  end

  def destroy?
    record.permit_application.submitter_id == user.id
  end

  def upload?
    true
  end
end
