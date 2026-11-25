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

  # A standalone Step Code belongs to its creator.
  # On an application, any block grant opens it. An application grant edits it.
  # A block grant edits it only when the energy block is granted.
  def create?
    return false unless user
    return true if record.permit_application.nil?

    step_code_editable?(record.permit_application)
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

  # A block grant or an application grant opens it.
  # Editing from a block grant still needs the energy block.
  def show?
    return false unless user && same_sandbox?
    application = record.permit_application
    return standalone_creator? if application.nil?

    project_access_for(application).view_application? ||
      application.application_granted_to?(user) ||
      application.block_granted_to?(user) ||
      (user.review_staff? && user.member_of?(application.jurisdiction))
  end

  def update?
    return false unless user && same_sandbox?
    return standalone_creator? if record.permit_application.nil?

    step_code_editable?(record.permit_application)
  end

  def reassign_to?(target_permit_application)
    return false unless user && target_permit_application

    step_code_editable?(target_permit_application)
  end

  private

  def standalone_creator?
    record.creator == user
  end

  def project_access_for(permit_application)
    access.on(permit_application.permit_project)
  end

  def step_code_editable?(permit_application)
    return true if project_access_for(permit_application).edit_application?
    return true if permit_application.application_granted_to?(user)

    permit_application.user_can_edit_step_code_block?(user_id: user.id)
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
