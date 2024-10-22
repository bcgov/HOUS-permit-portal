class StepCodePolicy < ApplicationPolicy
  def create?
    user.present?
  end

  def select_options?
    true
  end

  def update?
    record.submitter == user
  end

  def destroy?
    update?
  end

  def download_step_code_summary_csv?
    user.super_admin?
  end

  class Scope < Scope
    # NOTE: Be explicit about which records you allow access to!
    def resolve
      scope.includes(:permit_application).where(
        permit_applications: {
          submitter: user
        }
      )
    end
  end
end
