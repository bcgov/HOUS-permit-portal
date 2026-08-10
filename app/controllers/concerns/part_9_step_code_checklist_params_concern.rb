module Part9StepCodeChecklistParamsConcern
  extend ActiveSupport::Concern

  private

  def step_code_checklist_params
    params.require(:step_code_checklist).permit(*part_9_checklist_update_params)
  end

  def staged_step_code_checklist_params
    params.require(:step_code_checklist).permit(
      :stage,
      *part_9_checklist_update_params
    )
  end

  def part_9_checklist_update_params
    [
      # HUB-5145: `stage` is checklist identity, not editable form data. Set it
      # only when creating a staged checklist; use StepCode.current_stage to
      # choose which stage is active.
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
      {
        section_completion_status:
          Part9StepCode::Checklist.section_completion_status_params
      },
      {
        data_entries_attributes: [
          :id,
          :_destroy,
          :district_energy_ef,
          :district_energy_consumption,
          :other_ghg_ef,
          :other_ghg_consumption,
          {
            h2k_file: [
              :id,
              :storage,
              { metadata: %i[filename size mime_type content_disposition] }
            ]
          }
        ]
      },
      {
        building_characteristics_summary_attributes: [
          { roof_ceilings_lines: %i[details rsi] },
          { above_grade_walls_lines: %i[details rsi] },
          { framings_lines: %i[details rsi] },
          { unheated_floors_lines: %i[details rsi] },
          { below_grade_walls_lines: %i[details rsi] },
          { slabs_lines: %i[details rsi] },
          {
            windows_glazed_doors: [
              :performance_type,
              { lines: %i[details performance_value shgc] }
            ]
          },
          { doors_lines: %i[details performance_type performance_value] },
          { airtightness: [:details] },
          {
            space_heating_cooling_lines: %i[
              details
              performance_value
              performance_type
            ]
          },
          { hot_water_lines: %i[details performance_type performance_value] },
          { ventilation_lines: %i[details percent_eff liters_per_sec] },
          { other_lines: [:details] },
          { fossil_fuels: %i[details presence] }
        ]
      }
    ]
  end
end
