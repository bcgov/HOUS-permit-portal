class StepCodePolicy < ApplicationPolicy
  def download_step_code_summary_csv?
    user.super_admin?
  end

  def download_step_code_metrics_csv?
    user.super_admin?
  end
end
