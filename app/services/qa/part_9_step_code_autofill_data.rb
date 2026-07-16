# frozen_string_literal: true

module Qa
  module Part9StepCodeAutofillData
    H2K_FIXTURE_PATH =
      Rails.root.join("spec/support/Test Model side 1.h2k").freeze

    COMPLIANCE_PATH = :step_code_ers
    BUILDING_TYPE = :single_detached

    BUILDING_CHARACTERISTICS_SUMMARY = {
      roof_ceilings_lines: [{ details: "Roof", rsi: 6.0 }],
      doors_lines: [{ details: "Door", performance_value: 1.8 }]
    }.freeze

    ENERGY_PERFORMANCE = {
      hvac_consumption: 100,
      dwh_heating_consumption: 50,
      ref_hvac_consumption: 120,
      ref_dwh_heating_consumption: 60,
      epc_calculation_airtightness: :two_point_five,
      epc_calculation_testing_target_type: :ach,
      epc_calculation_compliance: true
    }.freeze

    COMPLETED_BY = {
      completed_by: "QA Tester",
      completed_by_email: "qa@example.com",
      completed_by_company: "QA Energy Consulting",
      completed_by_phone: "(250) 555-0100",
      completed_by_address: "123 QA Street, Victoria, BC",
      completed_by_service_organization: "QA Service Organization",
      energy_advisor_id: "QA-EA-001"
    }.freeze

    STEP_CODE_ATTRIBUTES = {
      full_address: "123 QA Street, Victoria, BC",
      reference_number: "QA-REF-001",
      permit_date: "2026-01-01",
      pid: "123456789"
    }.freeze

    QA_STEP_REQUIREMENT = {
      energy_step_required: 3,
      zero_carbon_step_required: 2
    }.freeze

    # The committed H2K fixture uses natural-gas equipment codes that fail
    # prescriptive zero-carbon step 2. Override to electric/zero-carbon values
    # after HOT2000 parsing so compliance reports populate in QA mode.
    DATA_ENTRY_COMPLIANCE_PATCH = {
      heating_furnace: 1,
      heating_boiler: 0,
      heating_combo: 0,
      hot_water: 1
    }.freeze
  end
end
