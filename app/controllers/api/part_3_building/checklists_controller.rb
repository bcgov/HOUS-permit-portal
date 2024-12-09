class Api::Part3Building::ChecklistsController < Api::ApplicationController
  before_action :set_and_authorize_checklist, only: %i[update]

  def update
    if @checklist.update(checklist_params)
      render_success @checklist,
                     nil,
                     { blueprint: StepCode::Part3::ChecklistBlueprint }
    else
      render_error "step_code_checklist.update_error",
                   message_opts: {
                     error_message: @checklist.errors.full_messages.join(", ")
                   }
    end
  end

  private

  def set_and_authorize_checklist
    @checklist = Part3StepCode::Checklist.find(params[:id])
    authorize @checklist
  end

  def checklist_params
    params.require(:checklist).permit(
      :building_height,
      :heating_degree_days,
      :climate_zone,
      section_completion_status: {
      },
      baseline_occupancies_attributes: %i[
        _destroy
        id
        key
        modelled_floor_area
        performance_requirement
        percent_better_requirement
        requirement_source
      ],
      fuel_types_attributes: %i[
        _destroy
        id
        key
        description
        emissions_factor
        source
      ]
    )
  end
end
