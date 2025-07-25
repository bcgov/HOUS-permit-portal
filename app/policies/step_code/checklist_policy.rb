class StepCode::ChecklistPolicy < ApplicationPolicy
  def show?
    step_code_policy = StepCodePolicy.new(user_context, record.step_code)
    step_code_policy.show?
  end

  def update?
    step_code_policy = StepCodePolicy.new(user_context, record.step_code)
    step_code_policy.update?
  end
end
