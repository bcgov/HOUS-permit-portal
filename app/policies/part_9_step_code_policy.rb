class Part9StepCodePolicy < ApplicationPolicy
  def create?
    user.present?
  end

  def destroy?
    record.submitter == user
  end
end
