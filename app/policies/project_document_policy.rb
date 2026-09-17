class ProjectDocumentPolicy < ApplicationPolicy
  def download?
    return false unless user && record&.permit_project

    project = record.permit_project
    return true if user.review_staff_of?(project.jurisdiction_id)
    return false unless project.owner_id == user.id
    return false if record.hidden_from_submitter?

    true
  end
end
