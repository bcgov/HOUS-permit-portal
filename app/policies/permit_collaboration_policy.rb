# frozen_string_literal: true

class PermitCollaborationPolicy < ApplicationPolicy
  def destroy?
    review_staff_in_application_jurisdiction?
  end

  # Same staff who can unassign. Does not cover resending a reviewer's
  # account invitation (see UsersController#reinvite).
  def reinvite?
    review_staff_in_application_jurisdiction?
  end

  private

  def review_staff_in_application_jurisdiction?
    user.review_staff? &&
      user
        .jurisdictions
        .find_by(id: record.permit_application.jurisdiction_id)
        .present?
  end
end
