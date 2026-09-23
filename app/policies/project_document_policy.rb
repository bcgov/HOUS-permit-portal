class ProjectDocumentPolicy < ApplicationPolicy
  def download?
    return false unless user && record&.permit_project

    record.permit_project.owner == user
  end
end
