class RevisionReferenceDocumentPolicy < ApplicationPolicy
  # GRANTS TODO: Standard with a grant on the application. Follows view_application?.
  def download?
    return false unless user && record.revision_request

    version = record.revision_request.submission_version
    application = version&.permit_application
    return false unless application

    return true if user.review_staff_of?(application.jurisdiction_id)
    return false unless access.on(application.permit_project).view_application?

    version.request_package_visible_to_submitter?
  end
end
