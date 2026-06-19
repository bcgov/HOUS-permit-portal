class Api::Part9Building::ChecklistsController < Api::ApplicationController
  before_action :set_and_authorize_checklist, only: %i[show update]

  def show
    # Prevent viewing checklists of archived step codes
    if @step_code_checklist.step_code&.discarded?
      return(
        render_error "step_code_checklist.show_archived_error",
                     {
                       status: 404,
                       log_args: {
                         errors: "Cannot view checklist of archived step code"
                       }
                     }
      )
    end

    render_success @step_code_checklist,
                   nil,
                   {
                     blueprint: StepCode::Part9::ChecklistBlueprint,
                     blueprint_opts: {
                       view: :extended
                     }
                   }
  end

  # PATCH /api/step_code_checklists
  def update
    # Update step_code reference_number if provided
    if params[:step_code_checklist][:reference_number].present? &&
         @step_code_checklist.step_code.present?
      @step_code_checklist.step_code.update(
        reference_number: params[:step_code_checklist][:reference_number]
      )
    end

    # Prevent updating checklists of archived step codes
    if @step_code_checklist.step_code&.discarded?
      return(
        render_error "step_code_checklist.update_archived_error",
                     {
                       status: 422,
                       log_args: {
                         errors: "Cannot update checklist of archived step code"
                       }
                     }
      )
    end

    data_entries_updated =
      params.dig(:step_code_checklist, :data_entries_attributes).present?

    if @step_code_checklist.update(step_code_checklist_params)
      if data_entries_updated
        @step_code_checklist.step_code&.process_current_h2k_files
      end

      # If the client requested report generation and this step code is standalone (no permit application),
      # enqueue the standalone report generation job.
      should_generate_report =
        ActiveModel::Type::Boolean.new.cast(
          params[:report_generation_requested]
        )
      if should_generate_report
        step_code = @step_code_checklist.step_code
        if step_code.present?
          StepCodeReportGenerationJob.perform_async(step_code.id)
        end
      end

      render_success @step_code_checklist,
                     "step_code_checklist.update_success",
                     {
                       blueprint: StepCode::Part9::ChecklistBlueprint,
                       blueprint_opts: {
                         view: :extended
                       }
                     }
    else
      render_error "step_code_checklist.update_error",
                   message_opts: {
                     error_message:
                       @step_code_checklist.errors.full_messages.join(", ")
                   }
    end
  end

  private

  def step_code_checklist_params
    params.require(:step_code_checklist).permit(
      # HUB-5145: `stage` is intentionally not part of normal edits today. If
      # As-Built checklists are user-created, stage should be set at creation
      # time and guarded from accidental edits afterward.
      :builder,
      :compliance_path,
      :completed_by,
      :completed_at,
      :completed_by_company,
      :completed_by_service_organization,
      :completed_by_phone,
      :energy_advisor_id,
      :completed_by_address,
      :completed_by_email,
      :hvac_consumption,
      :dwh_heating_consumption,
      :ref_hvac_consumption,
      :ref_dwh_heating_consumption,
      :epc_calculation_airtightness,
      :epc_calculation_testing_target_type,
      :epc_calculation_compliance,
      :building_type,
      :dwh_heating_consumption,
      :ref_dwh_heating_consumption,
      :ref_hvac_consumption,
      :hvac_consumption,
      :status,
      :step_requirement_id,
      { section_completion_status: part_9_section_completion_status_params },
      data_entries_attributes: [
        :id,
        :_destroy,
        :district_energy_ef,
        :district_energy_consumption,
        :other_ghg_ef,
        :other_ghg_consumption,
        h2k_file: [
          :id,
          :storage,
          metadata: %i[filename size mime_type content_disposition]
        ]
      ],
      building_characteristics_summary_attributes: [
        roof_ceilings_lines: %i[details rsi],
        above_grade_walls_lines: %i[details rsi],
        framings_lines: %i[details rsi],
        unheated_floors_lines: %i[details rsi],
        below_grade_walls_lines: %i[details rsi],
        slabs_lines: %i[details rsi],
        windows_glazed_doors: [
          :performance_type,
          lines: %i[details performance_value shgc]
        ],
        doors_lines: %i[details performance_type performance_value],
        airtightness: [:details],
        space_heating_cooling_lines: %i[
          details
          variant
          performance_value
          performance_type
        ],
        hot_water_lines: %i[details performance_type performance_value],
        ventilation_lines: %i[details percent_eff liters_per_sec],
        other_lines: [:details],
        fossil_fuels: %i[details presence]
      ]
    )
  end

  def part_9_section_completion_status_params
    {
      start: %i[complete relevant],
      project_info: %i[complete relevant],
      h2k_import: %i[complete relevant],
      compliance_summary: %i[complete relevant],
      completed_by: %i[complete relevant],
      building_characteristics: %i[complete relevant],
      energy_performance: %i[complete relevant],
      energy_step_compliance: %i[complete relevant],
      zero_carbon_compliance: %i[complete relevant],
      review: %i[complete relevant],
      report: %i[complete relevant]
    }
  end

  def set_and_authorize_checklist
    @step_code_checklist = Part9StepCode::Checklist.find(params[:id])
    authorize @step_code_checklist
  end
end
