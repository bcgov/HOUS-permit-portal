# frozen_string_literal: true

class PermitCollaborationPolicy < ApplicationPolicy
  def destroy?
    if record.submission?
      user == record.permit_application.submitter
    elsif record.review?
      user.review_staff? && user.jurisdictions.find_by(id: recor.permit_application.jurisdiction_id).present?
    else
      false
    end
  end
end
