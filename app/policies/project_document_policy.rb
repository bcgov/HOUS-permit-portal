class ProjectDocumentPolicy < ApplicationPolicy
  def download?
    # record is the ProjectDocument instance
    # user is the current_user
    return false unless user && record&.permit_project

    record.permit_project.owner == user
  end
end
