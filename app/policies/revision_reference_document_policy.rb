class RevisionReferenceDocumentPolicy < ApplicationPolicy
  def download?
    return false unless user && record.revision_request

    version = record.revision_request.submission_version
    application = version&.permit_application
    return false unless application

    return true if user.review_staff_of?(application.jurisdiction_id)

    submitter =
      application.submitter_id == user.id ||
        application.permit_project&.owner_id == user.id
    return false unless submitter

    version.request_package_visible_to_submitter?
  end
end
