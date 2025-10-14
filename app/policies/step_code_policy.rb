class StepCodePolicy < ApplicationPolicy
  def index?
    record.creator == user
  end

  def download_step_code_summary_csv?
    user.super_admin?
  end

  def download_step_code_metrics_csv?
    user.super_admin?
  end

  def create?
    return false unless user

    # If creating a standalone step code (no permit application), any logged-in user may create
    return true if record.permit_application.nil?

    # If tied to a permit application, only the submitter of that permit application may create
    record.permit_application.submitter == user
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

    if user.review_staff? &&
         user.member_of?(record.permit_application&.jurisdiction)
      return true
    end

    false
  end

  def update?
    return false unless user

    # Allow general updates by creator or current submitter of the associated permit application
    (user == record.creator) || (record.permit_application&.submitter == user)
  end

  # Specific guard used when (re)assigning a StepCode to a PermitApplication.
  # Only the submitter of the target PermitApplication is allowed to perform this action.
  def reassign_to?(target_permit_application)
    return false unless user

    target_permit_application&.submitter == user
  end

  class Scope < Scope
    # NOTE: Be explicit about which records you allow access to!
    def resolve
      scope.where(creator: user)
    end
  end
end
