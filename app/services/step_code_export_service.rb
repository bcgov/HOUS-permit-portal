class StepCodeExportService
  def summary_csv
    CSV.generate(headers: true) do |csv|
      csv << I18n.t("export.step_code_summary_csv_headers").split(",")
      jurisdictions = Jurisdiction.all
      permit_types = PermitType.all

      jurisdictions.each do |j|
        permit_types.each do |pt|
          jurisdiction_name = j.qualified_name
          permit_type = pt.name
          permit_type_required_steps =
            j.permit_type_required_steps_by_classification(pt)
          permit_type_required_steps.each do |jtsc|
            energy_step_required = jtsc.energy_step_required
            zero_carbon_step_required = jtsc.zero_carbon_step_required
            enabled =
              energy_step_required.present? ||
                zero_carbon_step_required.present?
            csv << [
              jurisdiction_name,
              permit_type,
              enabled,
              energy_step_required,
              zero_carbon_step_required
            ]
          end
        end
      end
    end
  end

  def part_3_metrics_csv
    CSV.generate(headers: true) do |csv|
      # Headers for Part 3 metrics
      csv << [
        "Application ID",
        "Jurisdiction",
        "Address",
        "Building Height",
        "Building Code Version",
        "Heating Degree Days",
        "Climate Zone",
        "Reference Annual Thermal Energy Demand",
        "Total Annual Thermal Energy Demand",
        "Total Annual Cooling Energy Demand",
        "Step Code Annual Thermal Energy Demand",
        "Generated Electricity",
        "Overheating Hours",
        "Pressurized Doors Count",
        "Pressurization Airflow Per Door",
        "Pressurized Corridors Area",
        "Suite Heating Energy",
        "Software",
        "Software Name",
        "Simulation Weather File",
        "Above Ground Wall Area",
        "Window to Wall Area Ratio",
        "Design Airtightness",
        "Tested Airtightness",
        "Modelled Infiltration Rate",
        "As Built Infiltration Rate",
        "Average Wall Clear Field R-Value",
        "Average Wall Effective R-Value",
        "Average Roof Clear Field R-Value",
        "Average Roof Effective R-Value",
        "Average Window Effective U-Value",
        "Average Window Solar Heat Gain Coefficient",
        "Average Occupant Density",
        "Average Lighting Power Density",
        "Average Ventilation Rate",
        "DHW Low Flow Savings",
        "Is Demand Control Ventilation Used",
        "Sensible Recovery Efficiency",
        "Heating System Plant",
        "Heating System Type",
        "Heating System Type Description",
        "Cooling System Plant",
        "Cooling System Type",
        "Cooling System Type Description",
        "DHW System Type",
        "DHW System Description",
        "Is Suite Sub Metered"
      ]

      # Get all submitted Part 3 step codes with their checklist
      Part3StepCode
        .includes(:permit_application, :checklist)
        .where(permit_applications: { status: %i[newly_submitted resubmitted] })
        .find_each do |step_code|
          checklist = step_code.checklist
          next unless checklist

          csv << [
            step_code.building_permit_number,
            step_code.jurisdiction_name,
            step_code.full_address,
            checklist.building_height,
            checklist.building_code_version,
            checklist.heating_degree_days,
            checklist.climate_zone,
            checklist.ref_annual_thermal_energy_demand,
            checklist.total_annual_thermal_energy_demand,
            checklist.total_annual_cooling_energy_demand,
            checklist.step_code_annual_thermal_energy_demand,
            checklist.generated_electricity,
            checklist.overheating_hours,
            checklist.pressurized_doors_count,
            checklist.pressurization_airflow_per_door,
            checklist.pressurized_corridors_area,
            checklist.suite_heating_energy,
            checklist.software,
            checklist.software_name,
            checklist.simulation_weather_file,
            checklist.above_ground_wall_area,
            checklist.window_to_wall_area_ratio,
            checklist.design_airtightness,
            checklist.tested_airtightness,
            checklist.modelled_infiltration_rate,
            checklist.as_built_infiltration_rate,
            checklist.average_wall_clear_field_r_value,
            checklist.average_wall_effective_r_value,
            checklist.average_roof_clear_field_r_value,
            checklist.average_roof_effective_r_value,
            checklist.average_window_effective_u_value,
            checklist.average_window_solar_heat_gain_coefficient,
            checklist.average_occupant_density,
            checklist.average_lighting_power_density,
            checklist.average_ventilation_rate,
            checklist.dhw_low_flow_savings,
            checklist.is_demand_control_ventilation_used,
            checklist.sensible_recovery_efficiency,
            checklist.heating_system_plant,
            checklist.heating_system_type,
            checklist.heating_system_type_description,
            checklist.cooling_system_plant,
            checklist.cooling_system_type,
            checklist.cooling_system_type_description,
            checklist.dhw_system_type,
            checklist.dhw_system_description,
            checklist.is_suite_sub_metered
          ]
        end
    end
  end

  def part_9_metrics_csv
    CSV.generate(headers: true) do |csv|
      # Headers for Part 9 metrics
      csv << [
        "Application ID",
        "Jurisdiction",
        "Address",
        "Building Type",
        "Compliance Path",
        "Energy Step",
        "Zero Carbon Step",
        "Building Status",
        "Compliance Status",
        "Site Visit Completed",
        "Site Visit Date",
        "Testing Pressure",
        "Testing Result",
        "HVAC Consumption",
        "DWH Heating Consumption",
        "Reference HVAC Consumption",
        "Reference DWH Heating Consumption",
        "EPC Calculation Airtightness",
        "EPC Calculation Testing Target Type",
        "EPC Calculation Compliance",
        "CODECO",
        "Notes"
      ]

      # Get all submitted Part 9 step codes with their checklists
      Part9StepCode
        .includes(:permit_application, :checklists)
        .where(permit_applications: { status: %i[newly_submitted resubmitted] })
        .find_each do |step_code|
          checklist = step_code.primary_checklist
          next unless checklist

          # Get compliance reports to extract energy and zero carbon steps
          compliance_report =
            checklist.selected_report ||
              checklist.passing_compliance_reports.first
          energy_step = compliance_report&.dig(:energy)&.step
          zero_carbon_step = compliance_report&.dig(:zero_carbon)&.step

          csv << [
            step_code.building_permit_number,
            step_code.jurisdiction_name,
            step_code.full_address,
            checklist.building_type,
            checklist.compliance_path,
            energy_step,
            zero_carbon_step,
            checklist.status,
            checklist.compliance_status,
            checklist.site_visit_completed,
            checklist.site_visit_date,
            checklist.testing_pressure,
            checklist.testing_result,
            checklist.hvac_consumption,
            checklist.dwh_heating_consumption,
            checklist.ref_hvac_consumption,
            checklist.ref_dwh_heating_consumption,
            checklist.epc_calculation_airtightness,
            checklist.epc_calculation_testing_target_type,
            checklist.epc_calculation_compliance,
            checklist.codeco,
            checklist.notes
          ]
        end
    end
  end
end
