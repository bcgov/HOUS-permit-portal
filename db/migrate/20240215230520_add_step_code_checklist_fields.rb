class AddStepCodeChecklistFields < ActiveRecord::Migration[7.1]
  def change
    add_column :step_code_checklists, :building_type, :integer
    add_column :step_code_checklists, :compliance_path, :integer
    add_column :step_code_checklists, :completed_by, :text
    add_column :step_code_checklists, :completed_at, :datetime
    add_column :step_code_checklists, :completed_by_company, :text
    add_column :step_code_checklists, :completed_by_phone, :text
    add_column :step_code_checklists, :completed_by_address, :text
    add_column :step_code_checklists, :completed_by_email, :text
    add_column :step_code_checklists, :completed_by_service_organization, :text
    add_column :step_code_checklists, :energy_advisor_id, :text
    # Building Characteristics Summary Fields
    # TODO
    # Mid Construction Checklist Fields
    add_column :step_code_checklists, :site_visit_completed, :boolean
    add_column :step_code_checklists, :site_visit_date, :boolean
    add_column :step_code_checklists, :testing_pressure, :integer
    add_column :step_code_checklists, :testing_pressure_direction, :integer
    add_column :step_code_checklists, :testing_result_type, :integer
    add_column :step_code_checklists, :testing_result, :decimal
    add_column :step_code_checklists, :tester_name, :text
    add_column :step_code_checklists, :tester_company_name, :text
    add_column :step_code_checklists, :tester_email, :text
    add_column :step_code_checklists, :tester_phone, :text
    add_column :step_code_checklists, :home_state, :text
    add_column :step_code_checklists, :compliance_status, :integer
    add_column :step_code_checklists, :notes, :text
    # Energy Performance Compliance (EPC) Fields
    add_column :step_code_checklists, :hvac_consumption, :decimal
    add_column :step_code_checklists, :dwh_heating_consumption, :decimal
    add_column :step_code_checklists, :ref_hvac_consumption, :decimal
    add_column :step_code_checklists, :ref_dwh_heating_consumption, :decimal
    add_column :step_code_checklists, :epc_calculation_airtightness, :integer
    add_column :step_code_checklists,
               :epc_calculation_testing_target_type,
               :integer
    add_column :step_code_checklists, :epc_calculation_compliance, :boolean
  end
end
