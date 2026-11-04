class ProjectDocumentPolicy < ApplicationPolicy
  def download?
    return false unless user && record&.permit_project

    # MEMBERSHIP COMMENT: later, authorize from membership.
    # owner_id only identifies the creator.
    record.permit_project.owner == user
  end
end
