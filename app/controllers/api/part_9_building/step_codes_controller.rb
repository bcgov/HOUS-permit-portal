class Api::Part9Building::StepCodesController < Api::ApplicationController
  include StepCodeParamsConcern
  before_action :set_step_code, only: [:show]

  def select_options
    authorize Part9StepCode, :select_options?
    render json: { data: Part9StepCode::Checklist.select_options }, status: :ok
  end

  # GET /api/part_9_building/step_codes/:id
  def show
    authorize @step_code
    render_success @step_code, nil, { blueprint: Part9StepCodeBlueprint }
  end

  # POST /api/step_codes
  def create
    temp_step_code = Part9StepCode.new(step_code_params_for_create)
    authorize temp_step_code
    begin
      Part9StepCode.transaction do
        @step_code =
          if step_code_params[:permit_application_id]
            # HUB-5145: This mirrors Part 3's one StepCode per permit behavior
            # even though Part 9 has checklist stages. Decide whether As-Built is
            # a new checklist under this StepCode or a separate linked report.
            Part9StepCode
              .kept
              .where(
                permit_application_id: step_code_params[:permit_application_id]
              )
              .first_or_create!(step_code_params_for_create)
          else
            Part9StepCode.create!(step_code_params_for_create)
          end

        render_success @step_code,
                       "step_code.create_success",
                       { blueprint: Part9StepCodeBlueprint } and return
      end
    rescue ActiveRecord::RecordInvalid => e
      render_error "step_code.create_error",
                   message_opts: {
                     error_message: e.record.errors.full_messages.join(", ")
                   }
    end
  end

  private

  def set_step_code
    @step_code = Part9StepCode.find(params[:id])
  end
end
