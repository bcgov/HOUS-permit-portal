class Part3StepCode::ChecklistPolicy < ApplicationPolicy
  def show?
    record.step_code.submitter == user || user.review_staff?
  end

  def update?
    # TODO: authorization for early access ??
    !record.step_code.permit_application ||
      record.step_code.submitter == user || user.review_staff?
  end
end
