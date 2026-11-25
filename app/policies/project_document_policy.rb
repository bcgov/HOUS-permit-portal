class ProjectDocumentPolicy < ApplicationPolicy
  # Project documents are disabled and out of the access grid. The creator
  # check is a closed door. If the feature returns, use project access.
  def download?
    return false unless user && record&.permit_project

    record.permit_project.owner == user
  end
end
