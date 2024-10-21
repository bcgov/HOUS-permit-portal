class StepCodeChecklistBlueprint < Blueprinter::Base
  identifier :id

  fields :stage, :status

  view :extended do
    include_view :project_info
    include_view :compliance_summary
    include_view :completed_by
    include_view :building_characteristics_summary
    include_view :mid_construction_testing_results
    include_view :compliance_reports
  end

  view :project_info do
    fields :building_permit_number,
           :jurisdiction_name,
           :pid,
           :building_type,
           :builder
    field :full_address, name: :address

    field :dwelling_units_count do |checklist, _options|
      checklist.data_entries.sum(:dwelling_units_count)
    end
  end

  view :compliance_summary do
    fields :compliance_path

    fields :plan_author, :plan_version, :plan_date
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
                blueprint: StepCodeBuildingCharacteristicsSummaryBlueprint
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
    transform StepCode::ComplianceReportsTransformer

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
      StepCode::ComplianceReportBlueprint.render_as_hash(report)
    end
  end
end
