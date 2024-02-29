class StepCodePolicy < ApplicationPolicy
  def create?
    user.submitter?
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

  class Scope < Scope
    # NOTE: Be explicit about which records you allow access to!
    def resolve
      scope.includes(:permit_application).where(permit_applications: { submitter: user })
    end
  end
end
