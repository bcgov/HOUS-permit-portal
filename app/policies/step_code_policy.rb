class StepCodePolicy < ApplicationPolicy
  def index?
    user.present?
  end

  def download_step_code_summary_csv?
    user.super_admin?
  end

  def download_step_code_metrics_csv?
    user.super_admin?
  end

  def download_part_9_step_code_checklists_csv?
    user.super_admin?
  end

  def download_part_3_step_code_checklists_csv?
    user.super_admin?
  end

  def download_step_code_file_uploads_zip?
    user.super_admin?
  end

  # A Step Code on an application follows that application's project access.
  # A standalone Step Code (no application) belongs to its creator.
  # GRANTS TODO: Standard with a block grant. An attached Step Code follows edit_application?.
  def create?
    return false unless user
    return true if record.permit_application.nil?

    project_access_for(record.permit_application).edit_application?
  end

  # Not limited to the Step Code creator.
  def destroy?
    return false unless user && same_sandbox?
    return standalone_creator? if record.permit_application.nil?

    project_access_for(record.permit_application).delete_step_code?
  end

  def restore?
    destroy?
  end

  # GRANTS TODO: Standard with a grant on the application. An attached Step Code follows view_application?.
  def show?
    return false unless user && same_sandbox?
    application = record.permit_application
    return standalone_creator? if application.nil?

    project_access_for(application).view_application? ||
      (user.review_staff? && user.member_of?(application.jurisdiction))
  end

  # GRANTS TODO: Standard with a block grant. An attached Step Code follows edit_application?.
  def update?
    return false unless user && same_sandbox?
    return standalone_creator? if record.permit_application.nil?

    project_access_for(record.permit_application).edit_application?
  end

  def reassign_to?(target_permit_application)
    return false unless user && target_permit_application

    project_access_for(target_permit_application).edit_application?
  end

  private

  def standalone_creator?
    record.creator == user
  end

  def project_access_for(permit_application)
    access.on(permit_application.permit_project)
  end

  def same_sandbox?
    return true if user&.super_admin?

    record.sandbox_id == sandbox&.id
  end

  class Scope < Scope
    # NOTE: Be explicit about which records you allow access to!
    def resolve
      return scope.none unless user

      permitted_permit_applications =
        PermitApplicationPolicy::Scope.new(
          UserContext.new(user, sandbox),
          PermitApplication.all
        ).resolve_viewable

      standalone_step_codes =
        scope.where(permit_application_id: nil, creator: user)
      attached_step_codes =
        scope.where(
          permit_application_id: permitted_permit_applications.select(:id)
        )

      visible = standalone_step_codes.or(attached_step_codes)
      return visible if user.super_admin?

      scope.where(id: visible.select(:id)).for_effective_sandbox(sandbox&.id)
    end
  end
end
