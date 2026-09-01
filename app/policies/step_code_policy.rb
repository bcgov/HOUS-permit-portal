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

  def download_step_code_file_uploads_zip?
    user.super_admin?
  end

  def create?
    return false unless user

    # If creating a standalone Step Code (no permit application), any logged-in user may create
    return true if record.permit_application.nil?

    record.permit_application.submitter == user ||
      collaborator_can_edit_step_code_block?
  end

  def destroy?
    record.creator == user || record.submitter == user
  end

  def restore?
    record.creator == user || record.submitter == user
  end

  def show?
    return false unless user

    return true if user == record.creator

    return true if record.permit_application&.submitter == user

    return true if collaborator_can_edit_step_code_block?

    if user.review_staff? &&
         user.member_of?(record.permit_application&.jurisdiction)
      return true
    end

    false
  end

  def update?
    return false unless user

    (user == record.creator) ||
      (record.permit_application&.submitter == user) ||
      collaborator_can_edit_step_code_block?
  end

  def reassign_to?(target_permit_application)
    return false unless user

    target_permit_application&.submitter == user ||
      collaborator_can_edit_step_code_block_on?(target_permit_application)
  end

  private

  def collaborator_can_edit_step_code_block?
    record.permit_application&.user_can_edit_step_code_block?(
      user_id: user.id
    ) || false
  end

  def collaborator_can_edit_step_code_block_on?(pa)
    pa&.user_can_edit_step_code_block?(user_id: user.id) || false
  end

  class Scope < Scope
    # NOTE: Be explicit about which records you allow access to!
    def resolve
      return scope.none unless user

      permitted_permit_applications =
        PermitApplicationPolicy::Scope.new(
          UserContext.new(user, sandbox),
          PermitApplication.all
        ).resolve

      standalone_step_codes =
        scope.where(permit_application_id: nil, creator: user)
      attached_step_codes =
        scope.where(
          permit_application_id: permitted_permit_applications.select(:id)
        )

      standalone_step_codes.or(attached_step_codes)
    end
  end
end
