class StepCodePolicy < ApplicationPolicy
  def create?
    user.submitter?
  end

  def show?
    record.submitter_id == user.id
  end

  def update?
    record.submitter_id == user.id
  end

  class Scope < Scope
    # NOTE: Be explicit about which records you allow access to!
    def resolve
      scope.includes(:permit_application).where(permit_applications: { submitter: user })
    end
  end
end
