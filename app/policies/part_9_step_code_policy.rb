class Part9StepCodePolicy < ApplicationPolicy
  def create?
    user.present?
  end

  def destroy?
    record.submitter == user
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
