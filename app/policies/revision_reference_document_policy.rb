class RevisionReferenceDocumentPolicy < ApplicationPolicy
  # Same view check as the application, and only after the package is published.
  def download?
    return false unless user && record.revision_request

    version = record.revision_request.submission_version
    application = version&.permit_application
    return false unless application

    return true if user.review_staff_of?(application.jurisdiction_id)

    opened =
      access.on(application.permit_project).view_application? ||
        application.application_granted_to?(user) ||
        application.block_granted_to?(user)
    return false unless opened

    version.request_package_visible_to_submitter?
  end
end
