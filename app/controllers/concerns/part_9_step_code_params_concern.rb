module Part9StepCodeParamsConcern
  extend ActiveSupport::Concern

  include StepCodeParamsConcern

  private

  def step_code_params
    params.require(:step_code).permit(
      *step_code_param_keys,
      # HUB-5145: StepCode creation still seeds only the pre-construction
      # checklist envelope. Additional stages should be created through explicit,
      # stage-aware paths whose permitted payloads can differ by stage.
      pre_construction_checklist_attributes:
        part_9_staged_checklist_attributes_params
    )
  end

  def part_9_staged_checklist_attributes_params
    [
      :compliance_path,
      {
        section_completion_status:
          Part9StepCode::Checklist.section_completion_status_params
      },
      {
        data_entries_attributes: [
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
      }
    ]
  end
end
