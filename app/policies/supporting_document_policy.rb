class SupportingDocumentPolicy < ApplicationPolicy
  def download?
    return true if project_access.view_application?
    return false unless user&.review_staff?

    user
      .jurisdictions
      .find_by(id: record.permit_application.jurisdiction.id)
      .present?
  end

  def destroy?
    project_access.edit_application?
  end

  def upload?
    project_access.edit_application?
  end

  private

  def project_access
    @project_access ||= access.on(record.permit_application&.permit_project)
  end
end
