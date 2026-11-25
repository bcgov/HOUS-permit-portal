require "rails_helper"

RSpec.describe StepCodeExportService do
  let(:service) { described_class.new }

  describe "#summary_csv" do
    it "outputs rows for each jurisdiction step requirement record" do
      required_steps_enabled =
        instance_double(
          "JurisdictionTemplateStepCode",
          energy_step_required: 3,
          zero_carbon_step_required: nil
        )
      required_steps_disabled =
        instance_double(
          "JurisdictionTemplateStepCode",
          energy_step_required: nil,
          zero_carbon_step_required: nil
        )
      jurisdiction =
        instance_double(
          "Jurisdiction",
          qualified_name: "City A",
          jurisdiction_step_requirements: [
            required_steps_enabled,
            required_steps_disabled
          ]
        )

      allow(Jurisdiction).to receive(:all).and_return([jurisdiction])

      allow(I18n).to receive(:t).with(
        "export.step_code_summary_csv_headers"
      ).and_return(
        "Jurisdiction,Permit Type,Enabled,Energy Step,Zero Carbon Step"
      )

      csv = service.summary_csv

      expect(csv).to include(
        "Jurisdiction,Permit Type,Enabled,Energy Step,Zero Carbon Step"
      )
      expect(csv).to include("City A,,true,3,")
      expect(csv).to include("City A,,false,,")
    end
  end

  describe "#part_3_metrics_csv" do
    it "outputs a row for each completed checklist" do
      step_code =
        instance_double(
          "Part3StepCode",
          reference_number: "APP-1",
          jurisdiction_name: "Jur A",
          full_address: "123 St"
        )
      checklist =
        instance_double(
          "Part3StepCode::Checklist",
          step_code: step_code,
          stage: "pre_construction",
          building_height: 10,
          building_code_version: "2024",
          heating_degree_days: 3000,
          climate_zone: 4,
          ref_annual_thermal_energy_demand: 1,
          total_annual_thermal_energy_demand: 2,
          total_annual_cooling_energy_demand: 3,
          step_code_annual_thermal_energy_demand: 4,
          generated_electricity: 5,
          overheating_hours: 6,
          pressurized_doors_count: 7,
          pressurization_airflow_per_door: 8,
          pressurized_corridors_area: 9,
          suite_heating_energy: 10,
          software: "HOT2000",
          software_name: "Hot2k",
          simulation_weather_file: "wx",
          above_ground_wall_area: 1,
          window_to_wall_area_ratio: 2,
          design_airtightness: 3,
          tested_airtightness: 4,
          modelled_infiltration_rate: 5,
          as_built_infiltration_rate: 6,
          average_wall_clear_field_r_value: 7,
          average_wall_effective_r_value: 8,
          average_roof_clear_field_r_value: 9,
          average_roof_effective_r_value: 10,
          average_window_effective_u_value: 11,
          average_window_solar_heat_gain_coefficient: 12,
          average_occupant_density: 13,
          average_lighting_power_density: 14,
          average_ventilation_rate: 15,
          dhw_low_flow_savings: 16,
          is_demand_control_ventilation_used: true,
          sensible_recovery_efficiency: 17,
          heating_system_plant: "plant",
          heating_system_type: "type",
          heating_system_type_description: "desc",
          cooling_system_plant: "cplant",
          cooling_system_type: "ctype",
          cooling_system_type_description: "cdesc",
          dhw_system_type: "dhw",
          dhw_system_description: "ddesc",
          is_suite_sub_metered: false
        )

      relation = double("ARRelation")
      allow(Part3StepCode::Checklist).to receive(:completed_live).and_return(
        relation
      )
      allow(relation).to receive(:includes).and_return(relation)
      allow(relation).to receive(:find_each).and_yield(checklist)

      csv = service.part_3_metrics_csv

      expect(csv).to include(
        "Reference number,Jurisdiction,Address,Stage,Building Height"
      )
      expect(csv).to include(
        "APP-1,Jur A,123 St,pre_construction,10,2024,3000,4"
      )
    end
  end

  describe "#part_9_metrics_csv" do
    it "uses selected_report when present" do
      compliance_report = {
        energy: OpenStruct.new(step: 4),
        zero_carbon: OpenStruct.new(step: 2)
      }
      step_code =
        instance_double(
          "Part9StepCode",
          reference_number: "APP-9",
          jurisdiction_name: "Jur 9",
          full_address: "9 St"
        )
      checklist =
        instance_double(
          "Part9StepCode::Checklist",
          step_code: step_code,
          stage: "pre_construction",
          building_type: "House",
          compliance_path: "step_code_ers",
          status: "draft",
          compliance_status: "passing",
          site_visit_completed: false,
          site_visit_date: nil,
          testing_pressure: 50,
          testing_result: 1.0,
          hvac_consumption: 2,
          dwh_heating_consumption: 3,
          ref_hvac_consumption: 4,
          ref_dwh_heating_consumption: 5,
          epc_calculation_airtightness: 6,
          epc_calculation_testing_target_type: "target",
          epc_calculation_compliance: true,
          codeco: "ok",
          notes: "n",
          selected_report: compliance_report,
          passing_compliance_reports: []
        )

      relation = double("ARRelation")
      allow(Part9StepCode::Checklist).to receive(:completed_live).and_return(
        relation
      )
      allow(relation).to receive(:includes).and_return(relation)
      allow(relation).to receive(:find_each).and_yield(checklist)

      csv = service.part_9_metrics_csv

      expect(csv).to include(
        "Reference number,Jurisdiction,Address,Stage,Building Type"
      )
      expect(csv).to include(
        "APP-9,Jur 9,9 St,pre_construction,House,step_code_ers,4,2"
      )
    end

    it "falls back to passing_compliance_reports.first when selected_report is nil" do
      fallback_report = {
        energy: OpenStruct.new(step: 3),
        zero_carbon: OpenStruct.new(step: 1)
      }
      step_code =
        instance_double(
          "Part9StepCode",
          reference_number: "APP-10",
          jurisdiction_name: "Jur 10",
          full_address: "10 St"
        )
      checklist =
        instance_double(
          "Part9StepCode::Checklist",
          step_code: step_code,
          stage: "as_built",
          building_type: "House",
          compliance_path: "step_code_ers",
          status: "draft",
          compliance_status: "passing",
          site_visit_completed: false,
          site_visit_date: nil,
          testing_pressure: nil,
          testing_result: nil,
          hvac_consumption: nil,
          dwh_heating_consumption: nil,
          ref_hvac_consumption: nil,
          ref_dwh_heating_consumption: nil,
          epc_calculation_airtightness: nil,
          epc_calculation_testing_target_type: nil,
          epc_calculation_compliance: nil,
          codeco: nil,
          notes: nil,
          selected_report: nil,
          passing_compliance_reports: [fallback_report]
        )

      relation = double("ARRelation")
      allow(Part9StepCode::Checklist).to receive(:completed_live).and_return(
        relation
      )
      allow(relation).to receive(:includes).and_return(relation)
      allow(relation).to receive(:find_each).and_yield(checklist)

      csv = service.part_9_metrics_csv

      expect(csv).to include(
        "APP-10,Jur 10,10 St,as_built,House,step_code_ers,3,1"
      )
    end
  end

  it "exports one row per completed checklist and skips drafts" do
    step_code = create(:part_3_step_code)
    mark_complete(step_code.pre_construction_checklist)
    mark_complete(step_code.find_or_create_checklist_for!(stage: "as_built"))
    create(:part_3_step_code)

    rows = CSV.parse(service.part_3_metrics_csv, headers: true)

    expect(rows.map { |row| row["Stage"] }).to contain_exactly(
      "pre_construction",
      "as_built"
    )
  end

  def mark_complete(checklist)
    checklist.update!(
      status: :complete,
      section_completion_status:
        checklist.class.fully_complete_section_completion_status,
      stage_completed_at: Time.current
    )
  end
end
