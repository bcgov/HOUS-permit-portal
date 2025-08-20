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
    user.present?
  end

  def destroy?
    record.submitter == user
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

    return true if user == record.creator

    return true if record.permit_application.submitter == user

    false
  end

  class Scope < Scope
    # NOTE: Be explicit about which records you allow access to!
    def resolve
      scope.where(creator: user)
    end
  end
end
