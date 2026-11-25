class SupportingDocumentPolicy < ApplicationPolicy
  # A block grant downloads the files whose data key is that block.
  def download?
    application = record.permit_application
    return false unless user && application
    return true if project_access.view_application?

    permissions =
      application.submission_requirement_block_edit_permissions(
        user_id: user.id
      )
    return true if permissions == :all
    if permissions.is_a?(Array) &&
         permissions.include?(
           application.block_id_from_data_key(record.data_key)
         )
      return true
    end

    return false unless user.review_staff?

    user.jurisdictions.find_by(id: application.jurisdiction.id).present?
  end

  def destroy?
    document_block_granted?
  end

  def upload?
    application = record.permit_application
    return false unless user && application

    application.submission_requirement_block_edit_permissions(
      user_id: user.id
    ).present?
  end

  private

  def project_access
    @project_access ||= access.on(record.permit_application&.permit_project)
  end

  def document_block_granted?
    application = record.permit_application
    return false unless user && application

    permissions =
      application.submission_requirement_block_edit_permissions(
        user_id: user.id
      )
    return true if permissions == :all
    return false unless permissions.is_a?(Array)

    permissions.include?(application.block_id_from_data_key(record.data_key))
  end
end
