class StepCode::ChecklistPolicy < ApplicationPolicy
  def show?
    # TODO: authorization for early access ??
    record.step_code.submitter == user || user.review_staff?
  end

  def update?
    # TODO: authorization for early access

    return false if record.step_code&.permit_application&.submitted?

    record.step_code.submitter == user || user.review_staff?
  end
end
