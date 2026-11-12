class SupportingDocumentPolicy < ApplicationPolicy
  # GRANTS TODO: Standard with a grant on the application. Follows view_application?.
  def download?
    return true if project_access.view_application?
    return false unless user&.review_staff?

    user
      .jurisdictions
      .find_by(id: record.permit_application.jurisdiction.id)
      .present?
  end

  # GRANTS TODO: Standard with a block grant. Follows edit_application?.
  def destroy?
    project_access.edit_application?
  end

  # GRANTS TODO: Standard with a block grant. Follows edit_application?.
  def upload?
    project_access.edit_application?
  end

  private

  def project_access
    @project_access ||= access.on(record.permit_application&.permit_project)
  end
end
