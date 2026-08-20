class MeetingRequestDocumentPolicy < ApplicationPolicy
  def download?
    return false unless user && permit_project

    user_is_review_staff_for_jurisdiction? ||
      permit_project.permissions_for(user).meetings_view?
  end

  private

  def permit_project
    project_meeting&.permit_project
  end

  def project_meeting
    record.project_meeting
  end

  def user_is_review_staff_for_jurisdiction?
    user.review_staff? && user.member_of?(permit_project.jurisdiction_id) &&
      !project_meeting.draft?
  end
end
