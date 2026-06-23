# frozen_string_literal: true

module Qa
  module Part3StepCodeAutofillData
    MODELLED_FLOOR_AREA = 1000

    STEP_CODE_OCCUPANCY = {
      key: :residential,
      occupancy_type: :step_code,
      modelled_floor_area: MODELLED_FLOOR_AREA,
      energy_step_required: 3,
      zero_carbon_step_required: 4
    }.freeze

    BASELINE_OCCUPANCY = {
      key: :low_hazard_industrial,
      occupancy_type: :baseline,
      modelled_floor_area: MODELLED_FLOOR_AREA,
      performance_requirement: :necb
    }.freeze

    CHECKLIST_ATTRIBUTES = {
      ref_annual_thermal_energy_demand: 50_000,
      total_annual_thermal_energy_demand: 80_000,
      total_annual_cooling_energy_demand: 15_000,
      step_code_annual_thermal_energy_demand: 30_000,
      pressurized_doors_count: 20,
      pressurization_airflow_per_door: 5.0,
      pressurized_corridors_area: 120,
      generated_electricity: 0,
      overheating_hours: 100,
      is_suite_sub_metered: :not_applicable,
      software: :ies_ve,
      software_name: nil,
      simulation_weather_file: "QA Weather File",
      above_ground_wall_area: "5000",
      window_to_wall_area_ratio: "0.35",
      design_airtightness: "2.0",
      modelled_infiltration_rate: "0.5",
      average_wall_clear_field_r_value: "3.5",
      average_wall_effective_r_value: "3.2",
      average_roof_clear_field_r_value: "5.0",
      average_roof_effective_r_value: "4.8",
      average_window_effective_u_value: "1.8",
      average_window_solar_heat_gain_coefficient: "0.4",
      average_occupant_density: "0.05",
      average_lighting_power_density: "10",
      average_ventilation_rate: "1.0",
      dhw_low_flow_savings: "0",
      is_demand_control_ventilation_used: false,
      sensible_recovery_efficiency: "0.75",
      heating_system_plant: :air_source_heat_pump,
      heating_system_type: :hydronic_fan_coils,
      cooling_system_plant: :air_cooled_chiller,
      cooling_system_type: :hydronic_fan_coils,
      dhw_system_type: :air_source_heat_pump,
      completed_by_name: "QA Tester",
      completed_by_title: "Energy Advisor",
      completed_by_email: "qa@example.com",
      completed_by_phone_number: "(250) 555-0100",
      completed_by_organization_name: "QA Energy Consulting"
    }.freeze

    REFERENCE_ENERGY_OUTPUTS = [
      { fuel_key: :electricity, annual_energy: 60_000 },
      { fuel_key: :natural_gas, annual_energy: 20_000 }
    ].freeze

    MODELLED_ENERGY_OUTPUTS = [
      {
        use_type: :interior_lighting,
        fuel_key: :electricity,
        annual_energy: 30_000
      },
      {
        use_type: :exterior_lighting,
        fuel_key: :electricity,
        annual_energy: 1000
      },
      {
        use_type: :heating_general,
        fuel_key: :electricity,
        annual_energy: 30_000
      },
      { use_type: :cooling, fuel_key: :electricity, annual_energy: 6000 },
      { use_type: :pumps, fuel_key: :electricity, annual_energy: 3000 },
      { use_type: :fans, fuel_key: :electricity, annual_energy: 15_000 },
      {
        use_type: :domestic_hot_water,
        fuel_key: :electricity,
        annual_energy: 35_000
      },
      { use_type: :plug_loads, fuel_key: :electricity, annual_energy: 40_000 },
      {
        use_type: :other,
        name: "Heating (natural gas)",
        fuel_key: :natural_gas,
        annual_energy: 20_000
      }
    ].freeze

    DOCUMENT_REFERENCES = [
      {
        document_type: :architectural_drawing,
        document_name: "QA Architectural Drawings",
        date_issued: "2026-01-01",
        prepared_by: "QA Architect"
      },
      {
        document_type: :mechanical_drawing,
        document_name: "QA Mechanical Drawings",
        date_issued: "2026-01-01",
        prepared_by: "QA Mechanical Engineer"
      },
      {
        document_type: :electrical_drawing,
        document_name: "QA Electrical Drawings",
        date_issued: "2026-01-01",
        prepared_by: "QA Electrical Engineer"
      }
    ].freeze

    STEP_CODE_ATTRIBUTES = {
      full_address: "123 QA Street, Victoria, BC",
      reference_number: "QA-REF-001",
      permit_date: "2026-01-01",
      phase: "Pre-construction"
    }.freeze

    SECTION_COMPLETION_STATUS =
      Part3StepCode::Checklist::SECTION_COMPLETION_STATUS_KEYS
        .index_with do |key|
          relevant = key != :additional_fuel_types
          { "complete" => true, "relevant" => relevant }
        end
        .freeze

    module_function

    def checklist_attributes_for(heating_degree_days:)
      climate_zone =
        StepCode::Part3::V0::Requirements::References::ClimateZone.value(
          heating_degree_days
        )

      CHECKLIST_ATTRIBUTES.merge(
        heating_degree_days: heating_degree_days,
        climate_zone: climate_zone
      )
    end
  end
end
