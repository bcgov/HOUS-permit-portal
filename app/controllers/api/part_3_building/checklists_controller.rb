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
      :ref_annual_thermal_energy_demand,
      :generated_electricity,
      :overheating_hours,
      :total_annual_thermal_energy_demand,
      :step_code_annual_thermal_energy_demand,
      :pressurized_doors_count,
      :pressurization_airflow_per_door,
      :pressurized_corridors_area,
      :is_suite_sub_metered,
      :suite_heating_energy,
      :heating_system_plant,
      :heating_system_type,
      :heating_system_plant_description,
      :heating_system_type_description,
      :cooling_system_plant,
      :cooling_system_type,
      :cooling_system_plant_description,
      :cooling_system_type_description,
      :dhw_system_type,
      :dhw_system_description,
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
      step_code_occupancies_attributes: %i[
        _destroy
        id
        key
        modelled_floor_area
        energy_step_required
        zero_carbon_step_required
        requirement_source
      ],
      fuel_types_attributes: %i[_destroy id key description emissions_factor],
      reference_energy_outputs_attributes: %i[id fuel_type_id annual_energy],
      modelled_energy_outputs_attributes: %i[
        _destroy
        id
        fuel_type_id
        use_type
        name
        annual_energy
      ],
      make_up_air_fuels_attributes: %i[_destroy id fuel_type_id percent_of_load]
    )
  end
end
