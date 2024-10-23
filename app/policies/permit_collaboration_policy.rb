# frozen_string_literal: true

class PermitCollaborationPolicy < ApplicationPolicy
  def destroy?
    if record.submission?
      user == record.permit_application.submitter
    elsif record.review?
      user.review_staff? &&
        user
          .jurisdictions
          .find_by(id: record.permit_application.jurisdiction_id)
          .present?
    else
      false
    end
  end

  def reinvite?
    record.submission? && record.collaborator.user.submitter? &&
      user == record.permit_application.submitter
  end
end
