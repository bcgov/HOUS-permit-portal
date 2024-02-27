class SupportingDocumentPolicy < ApplicationPolicy
  def download?
    if user.review_manager? || user.reviewer?
      record.permit_application.jurisdiction.id == user.jurisdiction_id
    elsif user.submitter?
      record.permit_application.submitter_id == user.id
    end
  end
end
