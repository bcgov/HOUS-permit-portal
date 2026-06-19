class StepCode::Part9::ChecklistBlueprint < Blueprinter::Base
  identifier :id

  # HUB-5145: Part 9 exposes checklist `stage` and `status`, but most consumers
  # still select the first/pre-construction checklist. As-Built work should make
  # this serialized stage drive routing, labels, status, and PDF selection.
  fields :stage, :status, :section_completion_status, :updated_at

  view :extended do
    include_view :project_info
    include_view :compliance_summary
    include_view :h2k_import
    include_view :completed_by
    include_view :building_characteristics_summary
    include_view :mid_construction_testing_results
    include_view :compliance_reports
  end

  view :project_info do
    fields :permit_application_number,
           :reference_number,
           :building_type,
           :builder

    field :title
    field :full_address
    field :pid
    field :jurisdiction_name
    field :permit_date do |checklist, _options|
      checklist.permit_date&.strftime("%b %e, %Y")
    end

    field :dwelling_units_count do |checklist, _options|
      checklist.data_entries.sum(:dwelling_units_count)
    end
  end

  view :compliance_summary do
    fields :compliance_path

    fields :plan_author, :plan_version, :plan_date
  end

  view :h2k_import do
    field :data_entries do |checklist, _options|
      checklist.data_entries.map do |data_entry|
        h2k_file_data = data_entry.h2k_file_data || {}
        h2k_file =
          if data_entry.h2k_file_attacher&.attached?
            {
              id: h2k_file_data["id"],
              storage: h2k_file_data["storage"],
              metadata: {
                size: h2k_file_data.dig("metadata", "size"),
                filename: h2k_file_data.dig("metadata", "filename"),
                mime_type: h2k_file_data.dig("metadata", "mime_type")
              }
            }
          end

        {
          id: data_entry.id,
          district_energy_ef: data_entry.district_energy_ef,
          district_energy_consumption: data_entry.district_energy_consumption,
          other_ghg_ef: data_entry.other_ghg_ef,
          other_ghg_consumption: data_entry.other_ghg_consumption,
          h2k_file: h2k_file
        }
      end
    end
  end

  view :completed_by do
    fields :completed_by,
           :completed_at,
           :completed_by_company,
           :completed_by_service_organization,
           :completed_by_email,
           :completed_by_phone,
           :completed_by_address,
           :energy_advisor_id,
           :codeco

    field :p_file_no do |checklist, _options|
      checklist.data_entries.pluck(:p_file_no).join(", ")
    end
  end

  view :building_characteristics_summary do
    association :building_characteristics_summary,
                blueprint:
                  StepCode::Part9::BuildingCharacteristicsSummaryBlueprint
  end

  view :mid_construction_testing_results do
    fields :site_visit_completed,
           :site_visit_date,
           :testing_pressure,
           :testing_pressure_direction,
           :testing_result_type,
           :testing_result,
           :tester_name,
           :tester_company_name,
           :tester_email,
           :tester_phone,
           :home_state,
           :compliance_status,
           :notes
  end

  view :compliance_reports do
    transform StepCode::Part9::ComplianceReportsTransformer

    fields :hvac_consumption,
           :dwh_heating_consumption,
           :ref_hvac_consumption,
           :ref_dwh_heating_consumption,
           :epc_calculation_airtightness,
           :epc_calculation_testing_target_type,
           :epc_calculation_compliance

    field :selected_report do |checklist, _options|
      report =
        checklist.selected_report || checklist.passing_compliance_reports[0] ||
          checklist.compliance_reports[0]
      next unless report

      StepCode::Part9::ComplianceReportBlueprint.render_as_hash(report)
    end
  end
end
