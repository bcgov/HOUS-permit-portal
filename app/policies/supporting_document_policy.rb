class SupportingDocumentPolicy < ApplicationPolicy
  def download?
    if user.review_manager? || user.reviewer?
      record.permit_application.jurisdiction.id == user.jurisdiction_id
    elsif user.submitter?
      record.permit_application.submitter_id == user.id
    else
      false
    end
  end

  def destroy?
    user.submitter? ? record.permit_application.submitter_id == user.id : false
  end

  def delete?
    destroy?
  end
end
