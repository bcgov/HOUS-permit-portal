class StepCodeChecklistBlueprint < Blueprinter::Base
  identifier :id

  fields :stage

  field :name do |checklist, _options|
    "#{checklist.stage.titleize} Checklist"
  end

  view :extended do
    include_view :project_info
    include_view :compliance_summary
    include_view :completed_by
    include_view :building_characteristics_summary
    include_view :mid_construction_testing_results
    include_view :energy_performance_compliance
    include_view :zero_carbon_step_code_compliance
  end

  view :project_info do
    # TODO: may not need these fields once step code is integrated with permit application flow
    # TODO: get build and postal code (TBD if needed?) from permit application
    fields :building_permit_number, :jurisdiction_name, :pid, :building_type
    field :full_address, name: :address

    field :dwelling_units_count do |checklist, _options|
      checklist.data_entries.sum(:dwelling_units_count)
    end
  end

  view :compliance_summary do
    fields :compliance_path

    # TODO: may not need these fields once step code is integrated with permit application flow
    # TODO: get values from permit application
    # field plan_author do |checklist, _options|
    #   checklist.step_code.permit_application.drawings_author
    # end
    # field plan_version do |checklist, _options|
    #   checklist.step_code.permit_application.drawings_version
    # end
    # field plan_date do |checklist, _options|
    #   checklist.step_code.permit_application.drawings_date
    # end

    # TODO: add required steps to jurisdiction
    # field :required_energy_step do |checklist, _options|
    #   checklist.step_code.permit_application.jurisdiction.required_energy_step
    # end
  end

  view :completed_by do
    fields :completed_by,
           :completed_at,
           :completed_by_company,
           :completed_by_service_organization,
           :completed_by_email,
           :completed_by_phone,
           :completed_by_address,
           :energy_advisor_id
  end

  view :building_characteristics_summary do
    # TODO
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

  view :energy_performance_compliance do
    transform StepCode::Energy::ComplianceTransformer

    fields :hvac_consumption,
           :dwh_heating_consumption,
           :ref_hvac_consumption,
           :ref_dwh_heating_consumption,
           :epc_calculation_airtightness,
           :epc_calculation_testing_target_type,
           :epc_calculation_compliance
  end

  view :zero_carbon_step_code_compliance do
    transform StepCode::ZeroCarbon::ComplianceTransformer
  end
end
