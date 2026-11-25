class ReportDocumentPolicy < ApplicationPolicy
  # Opening the Step Code. A standalone code is its creator. An attached
  # code follows the application's view check, including review staff.
  def download?
    step_code_policy.show?
  end

  # Editing the Step Code. Review staff can open an attached code and
  # cannot share it.
  def share?
    step_code_policy.update?
  end

  private

  def step_code_policy
    StepCodePolicy.new(user_context, record.step_code)
  end
end
