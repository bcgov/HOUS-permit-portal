module Part3StepCodeParamsConcern
  extend ActiveSupport::Concern

  include StepCodeParamsConcern

  private

  def step_code_params
    params.require(:step_code).permit(
      *step_code_param_keys,
      checklist_attributes: [
        {
          section_completion_status:
            Part3StepCode::Checklist.section_completion_status_params
        }
      ],
      pre_construction_checklist_attributes: [
        {
          section_completion_status:
            Part3StepCode::Checklist.section_completion_status_params
        }
      ]
    )
  end
end
