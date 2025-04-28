class StepCode::ChecklistPolicy < ApplicationPolicy
  def show?
    # TODO: authorization for early access ??
    record.step_code.submitter == user || user.review_staff?
  end

  def update?
    return true if record.step_code&.permit_application.blank?

    return false if record.step_code&.permit_application&.submitted?

    record.step_code.submitter == user || user.review_staff?
  end
end
