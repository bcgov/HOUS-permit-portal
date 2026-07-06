module StepCodeParamsConcern
  extend ActiveSupport::Concern

  private

  def step_code_param_keys
    [
      :type,
      :name,
      :permit_application_id,
      :permit_project_id,
      :full_address,
      :pid,
      :reference_number,
      :title,
      :permit_date,
      # HUB-5145: `phase` is legacy stage-like metadata. Replace it with a
      # normalized StepCode.current_stage selector while checklist.stage remains
      # the lifecycle identity for each child report.
      :phase,
      :current_stage,
      :building_code_version,
      :jurisdiction_id
    ]
  end

  def step_code_params
    params.require(:step_code).permit(*step_code_param_keys)
  end

  def step_code_params_for_create
    step_code_params.merge(creator: current_user)
  end
end
