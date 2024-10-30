class Part9StepCode::ChecklistPolicy < ApplicationPolicy
  def show?
    record.step_code.submitter == user || user.review_staff?
  end

  def update?
    show?
  end

  class Scope < Scope
    # NOTE: Be explicit about which records you allow access to!
    def resolve
      scope
      # scope.includes(:step_code).where(step_code: { submitter: user })
    end
  end
end
