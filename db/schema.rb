# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# This file is the source Rails uses to define your schema when running `bin/rails
# db:schema:load`. When creating a new database, `bin/rails db:schema:load` tends to
# be faster and is potentially less error prone than running all of your
# migrations from scratch. Old migrations may fail to apply correctly if those
# migrations use external dependencies or application code.
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema[7.2].define(version: 2026_01_29_185814) do
  # These are extensions that must be enabled in order to support this database
  enable_extension "pgcrypto"
  enable_extension "plpgsql"

  create_table "allowlisted_jwts", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.string "jti", null: false
    t.string "aud"
    t.datetime "exp", null: false
    t.uuid "user_id", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["jti"], name: "index_allowlisted_jwts_on_jti", unique: true
    t.index ["user_id"], name: "index_allowlisted_jwts_on_user_id"
  end

  create_table "api_key_expiration_notifications", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.uuid "external_api_key_id", null: false
    t.integer "notification_interval_days", null: false
    t.datetime "sent_at", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["external_api_key_id", "notification_interval_days"], name: "idx_api_key_expiration_notifications_on_key_id_and_interval", unique: true
    t.index ["external_api_key_id"], name: "index_api_key_expiration_notifications_on_external_api_key_id"
  end

  create_table "assets", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
  end

  create_table "collaborators", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.uuid "user_id", null: false
    t.string "collaboratorable_type", null: false
    t.uuid "collaboratorable_id", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["collaboratorable_type", "collaboratorable_id"], name: "idx_on_collaboratorable_type_collaboratorable_id_aa1cca136d"
    t.index ["collaboratorable_type", "collaboratorable_id"], name: "index_collaborators_on_collaboratorable"
    t.index ["user_id"], name: "index_collaborators_on_user_id"
  end

  create_table "contacts", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.string "title"
    t.string "email"
    t.string "phone"
    t.string "extension"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.string "department"
    t.string "organization"
    t.string "cell_number"
    t.string "first_name", default: "", null: false
    t.string "last_name", default: "", null: false
    t.string "cell"
    t.text "address"
    t.string "business_name"
    t.string "business_license"
    t.string "professional_association"
    t.string "professional_number"
    t.string "contactable_type"
    t.uuid "contactable_id"
    t.string "contact_type"
    t.index ["contactable_type", "contactable_id"], name: "index_contacts_on_contactable"
  end

  create_table "design_documents", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.uuid "pre_check_id", null: false
    t.text "file_data"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.string "scan_status", default: "pending", null: false
    t.index ["pre_check_id"], name: "index_design_documents_on_pre_check_id"
    t.index ["scan_status"], name: "index_design_documents_on_scan_status"
  end

  create_table "document_references", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.uuid "checklist_id"
    t.string "document_name"
    t.datetime "date_issued"
    t.string "prepared_by"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.integer "document_type", default: 0, null: false
    t.string "document_type_description"
    t.string "issued_for"
    t.index ["checklist_id"], name: "index_document_references_on_checklist_id"
  end

  create_table "early_access_previews", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.uuid "early_access_requirement_template_id", null: false
    t.uuid "previewer_id", null: false
    t.datetime "expires_at", null: false
    t.datetime "discarded_at"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["early_access_requirement_template_id", "previewer_id"], name: "index_early_access_previews_on_template_id_and_previewer_id", unique: true
    t.index ["previewer_id"], name: "index_early_access_previews_on_previewer_id"
  end

  create_table "end_user_license_agreements", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.text "content"
    t.boolean "active"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.integer "variant"
  end

  create_table "energy_outputs", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.uuid "fuel_type_id"
    t.uuid "checklist_id"
    t.integer "source"
    t.string "name"
    t.decimal "annual_energy"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.integer "use_type", default: 0
    t.index ["checklist_id"], name: "index_energy_outputs_on_checklist_id"
    t.index ["fuel_type_id"], name: "index_energy_outputs_on_fuel_type_id"
    t.index ["use_type"], name: "index_energy_outputs_on_use_type"
  end

  create_table "external_api_keys", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.string "token", limit: 510, null: false
    t.datetime "expired_at"
    t.datetime "revoked_at"
    t.string "name", null: false
    t.string "webhook_url"
    t.uuid "jurisdiction_id", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.string "connecting_application", null: false
    t.string "notification_email"
    t.uuid "sandbox_id"
    t.index ["jurisdiction_id"], name: "index_external_api_keys_on_jurisdiction_id"
    t.index ["sandbox_id"], name: "index_external_api_keys_on_sandbox_id"
    t.index ["token"], name: "index_external_api_keys_on_token", unique: true
  end

  create_table "fuel_types", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.uuid "checklist_id"
    t.string "description"
    t.decimal "emissions_factor"
    t.string "source"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.integer "key"
    t.index ["checklist_id"], name: "index_fuel_types_on_checklist_id"
  end

  create_table "integration_mapping_notifications", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.string "notifiable_type", null: false
    t.uuid "notifiable_id", null: false
    t.uuid "template_version_id", null: false
    t.string "front_end_path"
    t.datetime "processed_at"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["notifiable_type", "notifiable_id"], name: "index_integration_mapping_notifications_on_notifiable"
    t.index ["template_version_id"], name: "index_integration_mapping_notifications_on_template_version_id"
  end

  create_table "integration_mappings", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.jsonb "requirements_mapping", default: {}, null: false
    t.uuid "jurisdiction_id", null: false
    t.uuid "template_version_id", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["jurisdiction_id"], name: "index_integration_mappings_on_jurisdiction_id"
    t.index ["template_version_id"], name: "index_integration_mappings_on_template_version_id"
  end

  create_table "jurisdiction_memberships", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.uuid "jurisdiction_id", null: false
    t.uuid "user_id", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["jurisdiction_id"], name: "index_jurisdiction_memberships_on_jurisdiction_id"
    t.index ["user_id"], name: "index_jurisdiction_memberships_on_user_id"
  end

  create_table "jurisdiction_requirement_templates", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.uuid "jurisdiction_id", null: false
    t.uuid "requirement_template_id", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["jurisdiction_id", "requirement_template_id"], name: "index_jrt_on_jurisdiction_and_template", unique: true
    t.index ["jurisdiction_id"], name: "index_jurisdiction_requirement_templates_on_jurisdiction_id"
    t.index ["requirement_template_id"], name: "idx_on_requirement_template_id_df1d54db04"
  end

  create_table "jurisdiction_service_partner_enrollments", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.uuid "jurisdiction_id", null: false
    t.integer "service_partner", null: false
    t.boolean "enabled", default: true, null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["jurisdiction_id", "service_partner"], name: "index_jurisdiction_service_partner_unique", unique: true
    t.index ["jurisdiction_id"], name: "idx_on_jurisdiction_id_6fa7cce558"
  end

  create_table "jurisdiction_template_version_customizations", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.jsonb "customizations", default: {}
    t.uuid "jurisdiction_id", null: false
    t.uuid "template_version_id", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.uuid "sandbox_id"
    t.boolean "disabled", default: false, null: false
    t.index "jurisdiction_id, template_version_id, COALESCE(sandbox_id, '00000000-0000-0000-0000-000000000000'::uuid)", name: "index_jtvcs_unique_on_jurisdiction_template_sandbox", unique: true
    t.index ["jurisdiction_id"], name: "idx_on_jurisdiction_id_57cd0a7ea7"
    t.index ["sandbox_id"], name: "idx_on_sandbox_id_e5e6ef72b0"
    t.index ["template_version_id"], name: "idx_on_template_version_id_8359a99333"
  end

  create_table "jurisdictions", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.string "name"
    t.text "description_html"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.date "incorporation_date"
    t.string "postal_address"
    t.string "type"
    t.string "locality_type"
    t.uuid "regional_district_id"
    t.text "checklist_html"
    t.text "look_out_html"
    t.text "contact_summary_html"
    t.jsonb "map_position"
    t.string "prefix", null: false
    t.string "slug"
    t.integer "map_zoom"
    t.string "external_api_state", default: "g_off", null: false
    t.integer "heating_degree_days"
    t.boolean "inbox_enabled", default: false, null: false
    t.boolean "show_about_page", default: false, null: false
    t.boolean "allow_designated_reviewer", default: false
    t.string "disambiguator"
    t.boolean "first_nation", default: false
    t.string "ltsa_matcher"
    t.index ["ltsa_matcher"], name: "index_jurisdictions_on_ltsa_matcher"
    t.index ["prefix"], name: "index_jurisdictions_on_prefix", unique: true
    t.index ["regional_district_id"], name: "index_jurisdictions_on_regional_district_id"
    t.index ["slug"], name: "index_jurisdictions_on_slug", unique: true
  end

  create_table "make_up_air_fuels", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.uuid "fuel_type_id"
    t.uuid "checklist_id"
    t.decimal "percent_of_load"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["checklist_id"], name: "index_make_up_air_fuels_on_checklist_id"
    t.index ["fuel_type_id"], name: "index_make_up_air_fuels_on_fuel_type_id"
  end

  create_table "mechanical_energy_use_intensity_references", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.int4range "hdd"
    t.numrange "conditioned_space_percent"
    t.integer "step"
    t.int4range "conditioned_space_area"
    t.integer "meui"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["hdd", "conditioned_space_percent", "step", "conditioned_space_area"], name: "meui_composite_index", unique: true
  end

  create_table "occupancy_classifications", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.uuid "checklist_id"
    t.integer "key"
    t.decimal "modelled_floor_area"
    t.integer "performance_requirement"
    t.decimal "percent_better_requirement"
    t.integer "energy_step_required"
    t.integer "zero_carbon_step_required"
    t.string "requirement_source"
    t.integer "occupancy_type"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["checklist_id"], name: "index_occupancy_classifications_on_checklist_id"
    t.index ["key", "checklist_id"], name: "index_occupancy_classifications_on_key_and_checklist_id", unique: true
  end

  create_table "part_3_step_code_checklists", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.uuid "step_code_id"
    t.decimal "building_height"
    t.integer "building_code_version"
    t.integer "heating_degree_days"
    t.integer "climate_zone"
    t.decimal "ref_annual_thermal_energy_demand"
    t.decimal "total_annual_thermal_energy_demand"
    t.decimal "total_annual_cooling_energy_demand"
    t.decimal "step_code_annual_thermal_energy_demand"
    t.decimal "generated_electricity"
    t.decimal "overheating_hours"
    t.integer "pressurized_doors_count"
    t.decimal "pressurization_airflow_per_door"
    t.decimal "pressurized_corridors_area"
    t.decimal "suite_heating_energy"
    t.integer "software"
    t.string "software_name"
    t.string "simulation_weather_file"
    t.decimal "above_ground_wall_area"
    t.decimal "window_to_wall_area_ratio"
    t.decimal "design_airtightness"
    t.decimal "tested_airtightness"
    t.decimal "modelled_infiltration_rate"
    t.decimal "as_built_infiltration_rate"
    t.decimal "average_wall_clear_field_r_value"
    t.decimal "average_wall_effective_r_value"
    t.decimal "average_roof_clear_field_r_value"
    t.decimal "average_roof_effective_r_value"
    t.decimal "average_window_effective_u_value"
    t.decimal "average_window_solar_heat_gain_coefficient"
    t.decimal "average_occupant_density"
    t.decimal "average_lighting_power_density"
    t.decimal "average_ventilation_rate"
    t.decimal "dhw_low_flow_savings"
    t.boolean "is_demand_control_ventilation_used"
    t.decimal "sensible_recovery_efficiency"
    t.integer "heating_system_plant"
    t.integer "heating_system_type"
    t.string "heating_system_type_description"
    t.integer "cooling_system_plant"
    t.integer "cooling_system_type"
    t.string "cooling_system_type_description"
    t.integer "dhw_system_type"
    t.string "dhw_system_description"
    t.string "completed_by_name"
    t.string "completed_by_title"
    t.string "completed_by_phone_number"
    t.string "completed_by_email"
    t.string "completed_by_organization_name"
    t.string "submitted_at"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.jsonb "section_completion_status"
    t.string "heating_system_plant_description"
    t.string "cooling_system_plant_description"
    t.integer "is_suite_sub_metered"
    t.index ["step_code_id"], name: "index_part_3_step_code_checklists_on_step_code_id"
  end

  create_table "part_9_step_code_checklists", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.uuid "step_code_id"
    t.integer "stage", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.integer "building_type"
    t.integer "compliance_path"
    t.text "completed_by"
    t.datetime "completed_at"
    t.text "completed_by_company"
    t.text "completed_by_phone"
    t.text "completed_by_address"
    t.text "completed_by_email"
    t.text "completed_by_service_organization"
    t.text "energy_advisor_id"
    t.boolean "site_visit_completed"
    t.boolean "site_visit_date"
    t.integer "testing_pressure"
    t.integer "testing_pressure_direction"
    t.integer "testing_result_type"
    t.decimal "testing_result"
    t.text "tester_name"
    t.text "tester_company_name"
    t.text "tester_email"
    t.text "tester_phone"
    t.text "home_state"
    t.integer "compliance_status"
    t.text "notes"
    t.decimal "hvac_consumption"
    t.decimal "dwh_heating_consumption"
    t.decimal "ref_hvac_consumption"
    t.decimal "ref_dwh_heating_consumption"
    t.integer "epc_calculation_airtightness"
    t.integer "epc_calculation_testing_target_type"
    t.boolean "epc_calculation_compliance"
    t.boolean "codeco"
    t.integer "status", default: 0, null: false
    t.string "builder"
    t.uuid "step_requirement_id"
    t.index ["status"], name: "index_part_9_step_code_checklists_on_status"
    t.index ["step_code_id"], name: "index_part_9_step_code_checklists_on_step_code_id"
    t.index ["step_requirement_id"], name: "index_part_9_step_code_checklists_on_step_requirement_id"
  end

  create_table "permit_applications", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.integer "status", default: 0
    t.uuid "submitter_id", null: false
    t.uuid "jurisdiction_id"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.uuid "permit_type_id", null: false
    t.uuid "activity_id", null: false
    t.string "full_address"
    t.string "pid"
    t.string "pin"
    t.jsonb "submission_data"
    t.string "number"
    t.datetime "signed_off_at"
    t.string "nickname"
    t.datetime "viewed_at"
    t.jsonb "zipfile_data"
    t.uuid "template_version_id", null: false
    t.jsonb "form_customizations_snapshot"
    t.string "reference_number"
    t.jsonb "compliance_data", default: {}, null: false
    t.datetime "revisions_requested_at", precision: nil
    t.boolean "first_nations", default: false
    t.uuid "sandbox_id"
    t.datetime "newly_submitted_at", precision: nil
    t.uuid "permit_project_id"
    t.index ["activity_id"], name: "index_permit_applications_on_activity_id"
    t.index ["jurisdiction_id"], name: "index_permit_applications_on_jurisdiction_id"
    t.index ["number"], name: "index_permit_applications_on_number", unique: true
    t.index ["permit_project_id"], name: "index_permit_applications_on_permit_project_id"
    t.index ["permit_type_id"], name: "index_permit_applications_on_permit_type_id"
    t.index ["sandbox_id"], name: "index_permit_applications_on_sandbox_id"
    t.index ["submitter_id"], name: "index_permit_applications_on_submitter_id"
    t.index ["template_version_id"], name: "index_permit_applications_on_template_version_id"
  end

  create_table "permit_block_statuses", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.uuid "permit_application_id", null: false
    t.string "requirement_block_id", null: false
    t.integer "status", default: 0, null: false
    t.integer "collaboration_type", default: 0, null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["permit_application_id", "requirement_block_id", "collaboration_type"], name: "index_block_statuses_on_app_id_and_block_id_and_collab_type", unique: true
    t.index ["permit_application_id"], name: "index_permit_block_statuses_on_permit_application_id"
  end

  create_table "permit_classifications", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.string "name", null: false
    t.string "type", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.text "description_html"
    t.boolean "enabled"
    t.string "category"
    t.string "code"
    t.index ["code"], name: "index_permit_classifications_on_code", unique: true
  end

  create_table "permit_collaborations", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.uuid "collaborator_id", null: false
    t.uuid "permit_application_id", null: false
    t.integer "collaboration_type", default: 0
    t.integer "collaborator_type", default: 0
    t.string "assigned_requirement_block_id"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["collaboration_type"], name: "index_permit_collaborations_on_collaboration_type"
    t.index ["collaborator_id"], name: "index_permit_collaborations_on_collaborator_id"
    t.index ["collaborator_type"], name: "index_permit_collaborations_on_collaborator_type"
    t.index ["permit_application_id", "collaborator_id", "collaboration_type", "collaborator_type", "assigned_requirement_block_id"], name: "index_permit_collaborations_on_unique_columns", unique: true
    t.index ["permit_application_id"], name: "index_permit_collaborations_on_permit_application_id"
  end

  create_table "permit_projects", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.uuid "owner_id", null: false
    t.uuid "jurisdiction_id", null: false
    t.string "title"
    t.text "full_address"
    t.string "pid"
    t.string "pin"
    t.text "notes"
    t.date "permit_date"
    t.integer "rollup_status"
    t.datetime "discarded_at"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.string "number"
    t.index ["jurisdiction_id"], name: "index_permit_projects_on_jurisdiction_id"
    t.index ["number"], name: "index_permit_projects_on_number", unique: true
    t.index ["owner_id"], name: "index_permit_projects_on_owner_id"
  end

  create_table "permit_type_required_steps", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.uuid "jurisdiction_id", null: false
    t.uuid "permit_type_id"
    t.integer "energy_step_required"
    t.integer "zero_carbon_step_required"
    t.boolean "default"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["jurisdiction_id"], name: "index_permit_type_required_steps_on_jurisdiction_id"
    t.index ["permit_type_id"], name: "index_permit_type_required_steps_on_permit_type_id"
  end

  create_table "permit_type_submission_contacts", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.uuid "jurisdiction_id"
    t.uuid "permit_type_id"
    t.string "confirmation_token"
    t.datetime "confirmed_at"
    t.datetime "confirmation_sent_at"
    t.string "email", null: false
    t.index ["jurisdiction_id"], name: "index_permit_type_submission_contacts_on_jurisdiction_id"
    t.index ["permit_type_id"], name: "index_permit_type_submission_contacts_on_permit_type_id"
  end

  create_table "pinned_projects", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.uuid "user_id", null: false
    t.uuid "permit_project_id", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["permit_project_id"], name: "index_pinned_projects_on_permit_project_id"
    t.index ["user_id", "permit_project_id"], name: "index_pinned_projects_on_user_id_and_permit_project_id", unique: true
    t.index ["user_id"], name: "index_pinned_projects_on_user_id"
  end

  create_table "pre_checks", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.uuid "permit_application_id"
    t.uuid "permit_type_id"
    t.uuid "creator_id", null: false
    t.uuid "jurisdiction_id"
    t.string "external_id"
    t.string "full_address"
    t.string "pid"
    t.integer "service_partner", default: 0, null: false
    t.integer "status", default: 0, null: false
    t.integer "assessment_result"
    t.datetime "submitted_at"
    t.datetime "completed_at"
    t.datetime "viewed_at"
    t.text "result_message"
    t.string "pdf_report_url"
    t.string "viewer_url"
    t.boolean "eula_accepted", default: false, null: false
    t.boolean "consent_to_send_drawings", default: false, null: false
    t.boolean "consent_to_share_with_jurisdiction", default: false
    t.boolean "consent_to_research_contact", default: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["assessment_result"], name: "index_pre_checks_on_assessment_result"
    t.index ["completed_at"], name: "index_pre_checks_on_completed_at"
    t.index ["creator_id"], name: "index_pre_checks_on_creator_id"
    t.index ["external_id"], name: "index_pre_checks_on_external_id", unique: true
    t.index ["jurisdiction_id"], name: "index_pre_checks_on_jurisdiction_id"
    t.index ["permit_application_id"], name: "index_pre_checks_on_permit_application_id", unique: true
    t.index ["permit_type_id"], name: "index_pre_checks_on_permit_type_id"
    t.index ["service_partner"], name: "index_pre_checks_on_service_partner"
    t.index ["viewed_at"], name: "index_pre_checks_on_viewed_at"
  end

  create_table "preferences", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.uuid "user_id", null: false
    t.boolean "enable_in_app_new_template_version_publish_notification", default: true
    t.boolean "enable_email_new_template_version_publish_notification", default: true
    t.boolean "enable_in_app_customization_update_notification", default: true
    t.boolean "enable_email_customization_update_notification", default: true
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.boolean "enable_email_application_submission_notification", default: true
    t.boolean "enable_in_app_application_submission_notification", default: true
    t.boolean "enable_email_application_view_notification", default: true
    t.boolean "enable_in_app_application_view_notification", default: true
    t.boolean "enable_email_application_revisions_request_notification", default: true
    t.boolean "enable_in_app_application_revisions_request_notification", default: true
    t.boolean "enable_in_app_collaboration_notification", default: true
    t.boolean "enable_email_collaboration_notification", default: true
    t.boolean "enable_in_app_integration_mapping_notification", default: true
    t.boolean "enable_email_integration_mapping_notification", default: true
    t.boolean "enable_in_app_unmapped_api_notification", default: true
    t.boolean "enable_email_unmapped_api_notification", default: true
    t.boolean "enable_in_app_resource_reminder_notification", default: true
    t.boolean "enable_email_resource_reminder_notification", default: true
    t.index ["user_id"], name: "index_preferences_on_user_id"
  end

  create_table "project_documents", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.uuid "permit_project_id", null: false
    t.text "file_data"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.string "scan_status", default: "pending", null: false
    t.index ["permit_project_id"], name: "index_project_documents_on_permit_project_id"
    t.index ["scan_status"], name: "index_project_documents_on_scan_status"
  end

  create_table "report_documents", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.uuid "step_code_id", null: false
    t.jsonb "file_data"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.string "scan_status", default: "pending", null: false
    t.index ["scan_status"], name: "index_report_documents_on_scan_status"
    t.index ["step_code_id"], name: "index_report_documents_on_step_code_id"
  end

  create_table "requirement_blocks", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.string "name", null: false
    t.integer "sign_off_role", default: 0, null: false
    t.integer "reviewer_role", default: 0, null: false
    t.jsonb "custom_validations", default: {}, null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.string "description"
    t.string "sku"
    t.string "display_name", null: false
    t.string "display_description"
    t.boolean "first_nations", default: false
    t.datetime "discarded_at"
    t.integer "visibility", default: 0, null: false
    t.index ["discarded_at"], name: "index_requirement_blocks_on_discarded_at"
    t.index ["name", "first_nations"], name: "index_requirement_blocks_on_name_and_first_nations", unique: true, where: "(discarded_at IS NULL)"
    t.index ["sku"], name: "index_requirement_blocks_on_sku", unique: true
  end

  create_table "requirement_documents", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.uuid "requirement_block_id", null: false
    t.jsonb "file_data"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.string "scan_status", default: "pending", null: false
    t.index ["requirement_block_id"], name: "index_requirement_documents_on_requirement_block_id"
    t.index ["scan_status"], name: "index_requirement_documents_on_scan_status"
  end

  create_table "requirement_template_sections", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.string "name"
    t.uuid "requirement_template_id", null: false
    t.integer "position"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.uuid "copied_from_id"
    t.index ["copied_from_id"], name: "index_requirement_template_sections_on_copied_from_id"
    t.index ["requirement_template_id"], name: "index_requirement_template_sections_on_requirement_template_id"
  end

  create_table "requirement_templates", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.uuid "activity_id", null: false
    t.uuid "permit_type_id", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.string "description"
    t.datetime "discarded_at"
    t.boolean "first_nations", default: false
    t.string "type"
    t.string "nickname"
    t.datetime "fetched_at"
    t.uuid "copied_from_id"
    t.uuid "assignee_id"
    t.boolean "public", default: false
    t.uuid "site_configuration_id"
    t.boolean "available_globally"
    t.index ["activity_id"], name: "index_requirement_templates_on_activity_id"
    t.index ["assignee_id"], name: "index_requirement_templates_on_assignee_id"
    t.index ["copied_from_id"], name: "index_requirement_templates_on_copied_from_id"
    t.index ["discarded_at"], name: "index_requirement_templates_on_discarded_at"
    t.index ["permit_type_id"], name: "index_requirement_templates_on_permit_type_id"
    t.index ["site_configuration_id"], name: "index_requirement_templates_on_site_configuration_id"
    t.index ["type"], name: "index_requirement_templates_on_type"
  end

  create_table "requirements", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.string "requirement_code", null: false
    t.string "label"
    t.integer "input_type", null: false
    t.jsonb "input_options", default: {}, null: false
    t.string "hint"
    t.boolean "required", default: true, null: false
    t.string "related_content"
    t.boolean "required_for_in_person_hint", default: false, null: false
    t.boolean "required_for_multiple_owners", default: false, null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.uuid "requirement_block_id", null: false
    t.integer "position"
    t.boolean "elective", default: false
    t.text "instructions"
    t.index ["requirement_block_id"], name: "index_requirements_on_requirement_block_id"
  end

  create_table "resource_documents", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.text "file_data"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.uuid "resource_id", null: false
    t.string "scan_status", default: "pending", null: false
    t.index ["resource_id"], name: "index_resource_documents_on_resource_id"
    t.index ["scan_status"], name: "index_resource_documents_on_scan_status"
  end

  create_table "resources", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.uuid "jurisdiction_id", null: false
    t.string "category", null: false
    t.string "title", null: false
    t.text "description"
    t.string "resource_type", null: false
    t.string "link_url"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.datetime "last_reminder_sent_at"
    t.index ["jurisdiction_id", "category"], name: "index_resources_on_jurisdiction_id_and_category"
    t.index ["jurisdiction_id"], name: "index_resources_on_jurisdiction_id"
    t.index ["last_reminder_sent_at"], name: "index_resources_on_last_reminder_sent_at"
  end

  create_table "revision_reasons", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.string "reason_code", limit: 64
    t.string "description"
    t.uuid "site_configuration_id", null: false
    t.datetime "discarded_at"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.boolean "_discard"
    t.index ["reason_code"], name: "index_revision_reasons_on_reason_code", unique: true
    t.index ["site_configuration_id"], name: "index_revision_reasons_on_site_configuration_id"
  end

  create_table "revision_requests", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.string "reason_code", limit: 64
    t.jsonb "requirement_json"
    t.jsonb "submission_data"
    t.string "comment", limit: 350
    t.uuid "submission_version_id", null: false
    t.uuid "user_id", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["submission_version_id"], name: "index_revision_requests_on_submission_version_id"
    t.index ["user_id"], name: "index_revision_requests_on_user_id"
  end

  create_table "sandboxes", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.uuid "jurisdiction_id", null: false
    t.string "name", null: false
    t.integer "template_version_status_scope", default: 0, null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.text "description"
    t.index ["jurisdiction_id"], name: "index_sandboxes_on_jurisdiction_id"
  end

  create_table "site_configurations", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.boolean "display_sitewide_message"
    t.text "sitewide_message"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.jsonb "help_link_items", default: {"dictionary_link_item"=>{"href"=>"", "show"=>false, "title"=>"Dictionary of terms", "description"=>"See detailed explanations of terms that appear on building permits"}, "user_guide_link_item"=>{"href"=>"", "show"=>false, "title"=>"User and role guides", "description"=>"Step-by-step instructions on how to make the most out of the platform"}, "get_started_link_item"=>{"href"=>"", "show"=>false, "title"=>"Get started on Building Permit Hub", "description"=>"How to submit a building permit application through a streamlined and standardized approach across BC"}, "best_practices_link_item"=>{"href"=>"", "show"=>false, "title"=>"Best practices", "description"=>"How to use the Building Permit Hub efficiently for application submission"}}, null: false
    t.jsonb "revision_reason_options"
    t.boolean "inbox_enabled", default: false, null: false
    t.boolean "allow_designated_reviewer", default: false, null: false
    t.boolean "code_compliance_enabled", default: false, null: false
    t.boolean "archistar_enabled_for_all_jurisdictions", default: false, null: false
  end

  create_table "step_code_building_characteristics_summaries", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.uuid "checklist_id", null: false
    t.jsonb "roof_ceilings_lines", default: [{}]
    t.jsonb "above_grade_walls_lines", default: [{}]
    t.jsonb "framings_lines", default: [{}]
    t.jsonb "unheated_floors_lines", default: [{}]
    t.jsonb "below_grade_walls_lines", default: [{}]
    t.jsonb "slabs_lines", default: [{}]
    t.jsonb "windows_glazed_doors", default: {"lines"=>[{}], "performance_type"=>"usi"}
    t.jsonb "doors_lines", default: [{"performance_type"=>"rsi"}]
    t.jsonb "airtightness", default: {}
    t.jsonb "space_heating_cooling_lines", default: [{"variant"=>"principal"}, {"variant"=>"secondary"}]
    t.jsonb "hot_water_lines", default: [{"performance_type"=>"ef"}]
    t.jsonb "ventilation_lines", default: [{}]
    t.jsonb "other_lines", default: [{}]
    t.jsonb "fossil_fuels", default: {}
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["checklist_id"], name: "idx_on_checklist_id_65832bada2"
  end

  create_table "step_code_data_entries", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.string "model"
    t.string "version"
    t.string "weather_location"
    t.decimal "fwdr"
    t.string "p_file_no"
    t.decimal "above_grade_heated_floor_area"
    t.decimal "below_grade_heated_floor_area"
    t.integer "dwelling_units_count"
    t.decimal "baseloads"
    t.integer "hdd"
    t.decimal "aec"
    t.decimal "ref_aec"
    t.decimal "building_envelope_surface_area"
    t.decimal "building_volume"
    t.decimal "ach"
    t.decimal "nla"
    t.decimal "aux_energy_required"
    t.decimal "proposed_gshl"
    t.decimal "ref_gshl"
    t.decimal "design_cooling_load"
    t.decimal "ac_cooling_capacity"
    t.decimal "air_heat_pump_cooling_capacity"
    t.decimal "grounded_heat_pump_cooling_capacity"
    t.decimal "water_heat_pump_cooling_capacity"
    t.decimal "heating_furnace"
    t.decimal "heating_boiler"
    t.decimal "heating_combo"
    t.decimal "electrical_consumption"
    t.decimal "natural_gas_consumption"
    t.decimal "propane_consumption"
    t.decimal "district_energy_consumption"
    t.decimal "district_energy_ef"
    t.decimal "other_ghg_consumption"
    t.decimal "other_ghg_ef"
    t.decimal "hot_water"
    t.decimal "cooking"
    t.decimal "laundry"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.jsonb "h2k_file_data"
    t.uuid "checklist_id"
    t.index ["checklist_id"], name: "index_step_code_data_entries_on_checklist_id"
  end

  create_table "step_codes", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.uuid "permit_application_id"
    t.string "plan_author"
    t.string "plan_version"
    t.string "plan_date"
    t.string "type"
    t.uuid "permit_project_id"
    t.uuid "creator_id", null: false
    t.string "full_address"
    t.string "pid"
    t.string "pin"
    t.uuid "jurisdiction_id"
    t.string "reference_number"
    t.string "title"
    t.date "permit_date"
    t.string "phase"
    t.string "building_code_version"
    t.datetime "discarded_at"
    t.index ["creator_id"], name: "index_step_codes_on_creator_id"
    t.index ["discarded_at"], name: "index_step_codes_on_discarded_at"
    t.index ["jurisdiction_id"], name: "index_step_codes_on_jurisdiction_id"
    t.index ["permit_application_id"], name: "index_step_codes_on_permit_application_id"
    t.index ["permit_project_id"], name: "index_step_codes_on_permit_project_id"
  end

  create_table "submission_versions", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.jsonb "form_json"
    t.jsonb "submission_data"
    t.uuid "permit_application_id", null: false
    t.datetime "viewed_at", precision: nil
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.jsonb "step_code_checklist_json", default: {}
    t.index ["permit_application_id"], name: "index_submission_versions_on_permit_application_id"
  end

  create_table "supporting_documents", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.uuid "permit_application_id", null: false
    t.jsonb "file_data"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.jsonb "compliance_data", default: {}, null: false
    t.string "data_key"
    t.uuid "submission_version_id"
    t.string "scan_status", default: "pending", null: false
    t.index ["permit_application_id"], name: "index_supporting_documents_on_permit_application_id"
    t.index ["scan_status"], name: "index_supporting_documents_on_scan_status"
    t.index ["submission_version_id"], name: "index_supporting_documents_on_submission_version_id"
  end

  create_table "taggings", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.uuid "tag_id"
    t.string "taggable_type"
    t.uuid "taggable_id"
    t.string "tagger_type"
    t.uuid "tagger_id"
    t.string "context", limit: 128
    t.datetime "created_at", precision: nil
    t.string "tenant", limit: 128
    t.index ["context"], name: "index_taggings_on_context"
    t.index ["tag_id", "taggable_id", "taggable_type", "context", "tagger_id", "tagger_type"], name: "taggings_idx", unique: true
    t.index ["tag_id"], name: "index_taggings_on_tag_id"
    t.index ["taggable_id", "taggable_type", "context"], name: "taggings_taggable_context_idx"
    t.index ["taggable_id", "taggable_type", "tagger_id", "context"], name: "taggings_idy"
    t.index ["taggable_id"], name: "index_taggings_on_taggable_id"
    t.index ["taggable_type", "taggable_id"], name: "index_taggings_on_taggable_type_and_taggable_id"
    t.index ["taggable_type"], name: "index_taggings_on_taggable_type"
    t.index ["tagger_id", "tagger_type"], name: "index_taggings_on_tagger_id_and_tagger_type"
    t.index ["tagger_id"], name: "index_taggings_on_tagger_id"
    t.index ["tagger_type", "tagger_id"], name: "index_taggings_on_tagger_type_and_tagger_id"
    t.index ["tenant"], name: "index_taggings_on_tenant"
  end

  create_table "tags", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.string "name"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.integer "taggings_count", default: 0
    t.index ["name"], name: "index_tags_on_name", unique: true
  end

  create_table "template_section_blocks", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.uuid "requirement_template_section_id", null: false
    t.uuid "requirement_block_id", null: false
    t.integer "position"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["requirement_block_id"], name: "index_template_section_blocks_on_requirement_block_id"
    t.index ["requirement_template_section_id"], name: "idx_on_requirement_template_section_id_5469986497"
  end

  create_table "template_versions", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.jsonb "denormalized_template_json", default: {}
    t.jsonb "form_json", default: {}
    t.jsonb "requirement_blocks_json", default: {}
    t.json "version_diff", default: {}
    t.date "version_date", null: false
    t.integer "status", default: 0
    t.uuid "requirement_template_id"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.integer "deprecation_reason"
    t.uuid "deprecated_by_id"
    t.integer "jurisdiction_template_version_customizations_count", default: 0, null: false
    t.index ["deprecated_by_id"], name: "index_template_versions_on_deprecated_by_id"
    t.index ["requirement_template_id"], name: "index_template_versions_on_requirement_template_id"
  end

  create_table "thermal_energy_demand_intensity_references", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.int4range "hdd"
    t.integer "step"
    t.decimal "ach"
    t.decimal "nla"
    t.decimal "nlr"
    t.integer "ltrh_over_300"
    t.integer "ltrh_under_300"
    t.integer "tedi"
    t.integer "hdd_adjusted_tedi"
    t.integer "gshl_over_300"
    t.integer "gshl_under_300"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["hdd", "step"], name: "tedi_composite_index", unique: true
  end

  create_table "user_license_agreements", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.uuid "user_id", null: false
    t.uuid "agreement_id", null: false
    t.datetime "accepted_at", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["agreement_id"], name: "index_user_license_agreements_on_agreement_id"
    t.index ["user_id"], name: "index_user_license_agreements_on_user_id"
  end

  create_table "users", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.string "email"
    t.string "organization"
    t.boolean "certified", default: false, null: false
    t.string "encrypted_password", default: "", null: false
    t.string "reset_password_token"
    t.datetime "reset_password_sent_at"
    t.datetime "remember_created_at"
    t.string "confirmation_token"
    t.datetime "confirmed_at"
    t.datetime "confirmation_sent_at"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.integer "role", default: 0
    t.string "first_name"
    t.string "last_name"
    t.string "invitation_token"
    t.datetime "invitation_created_at"
    t.datetime "invitation_sent_at"
    t.datetime "invitation_accepted_at"
    t.integer "invitation_limit"
    t.string "invited_by_type"
    t.uuid "invited_by_id"
    t.integer "invitations_count", default: 0
    t.string "omniauth_provider"
    t.string "omniauth_uid"
    t.datetime "discarded_at"
    t.integer "sign_in_count", default: 0, null: false
    t.datetime "current_sign_in_at"
    t.datetime "last_sign_in_at"
    t.string "unconfirmed_email"
    t.string "omniauth_email"
    t.string "omniauth_username"
    t.string "department"
    t.index ["confirmation_token"], name: "index_users_on_confirmation_token", unique: true
    t.index ["discarded_at"], name: "index_users_on_discarded_at"
    t.index ["email"], name: "index_users_on_email"
    t.index ["invitation_token"], name: "index_users_on_invitation_token", unique: true
    t.index ["invited_by_id"], name: "index_users_on_invited_by_id"
    t.index ["invited_by_type", "invited_by_id"], name: "index_users_on_invited_by"
    t.index ["omniauth_provider", "omniauth_uid"], name: "index_users_on_omniauth_provider_and_omniauth_uid", unique: true
    t.index ["reset_password_token"], name: "index_users_on_reset_password_token", unique: true
  end

  add_foreign_key "allowlisted_jwts", "users", on_delete: :cascade
  add_foreign_key "api_key_expiration_notifications", "external_api_keys"
  add_foreign_key "collaborators", "users"
  add_foreign_key "design_documents", "pre_checks"
  add_foreign_key "document_references", "part_3_step_code_checklists", column: "checklist_id"
  add_foreign_key "early_access_previews", "users", column: "previewer_id"
  add_foreign_key "energy_outputs", "part_3_step_code_checklists", column: "checklist_id"
  add_foreign_key "external_api_keys", "jurisdictions"
  add_foreign_key "external_api_keys", "sandboxes"
  add_foreign_key "fuel_types", "part_3_step_code_checklists", column: "checklist_id"
  add_foreign_key "integration_mapping_notifications", "template_versions"
  add_foreign_key "integration_mappings", "jurisdictions"
  add_foreign_key "integration_mappings", "template_versions"
  add_foreign_key "jurisdiction_memberships", "jurisdictions"
  add_foreign_key "jurisdiction_memberships", "users"
  add_foreign_key "jurisdiction_requirement_templates", "jurisdictions"
  add_foreign_key "jurisdiction_requirement_templates", "requirement_templates"
  add_foreign_key "jurisdiction_service_partner_enrollments", "jurisdictions"
  add_foreign_key "jurisdiction_template_version_customizations", "jurisdictions"
  add_foreign_key "jurisdiction_template_version_customizations", "sandboxes"
  add_foreign_key "jurisdiction_template_version_customizations", "template_versions"
  add_foreign_key "jurisdictions", "jurisdictions", column: "regional_district_id"
  add_foreign_key "make_up_air_fuels", "part_3_step_code_checklists", column: "checklist_id"
  add_foreign_key "occupancy_classifications", "part_3_step_code_checklists", column: "checklist_id"
  add_foreign_key "part_3_step_code_checklists", "step_codes"
  add_foreign_key "part_9_step_code_checklists", "permit_type_required_steps", column: "step_requirement_id"
  add_foreign_key "part_9_step_code_checklists", "step_codes"
  add_foreign_key "permit_applications", "jurisdictions"
  add_foreign_key "permit_applications", "permit_classifications", column: "activity_id"
  add_foreign_key "permit_applications", "permit_classifications", column: "permit_type_id"
  add_foreign_key "permit_applications", "permit_projects"
  add_foreign_key "permit_applications", "sandboxes"
  add_foreign_key "permit_applications", "template_versions"
  add_foreign_key "permit_applications", "users", column: "submitter_id"
  add_foreign_key "permit_block_statuses", "permit_applications"
  add_foreign_key "permit_collaborations", "collaborators"
  add_foreign_key "permit_collaborations", "permit_applications"
  add_foreign_key "permit_projects", "jurisdictions"
  add_foreign_key "permit_projects", "users", column: "owner_id"
  add_foreign_key "permit_type_required_steps", "jurisdictions"
  add_foreign_key "permit_type_required_steps", "permit_classifications", column: "permit_type_id"
  add_foreign_key "permit_type_submission_contacts", "jurisdictions"
  add_foreign_key "permit_type_submission_contacts", "permit_classifications", column: "permit_type_id"
  add_foreign_key "pinned_projects", "permit_projects"
  add_foreign_key "pinned_projects", "users"
  add_foreign_key "pre_checks", "jurisdictions"
  add_foreign_key "pre_checks", "permit_applications"
  add_foreign_key "pre_checks", "permit_classifications", column: "permit_type_id"
  add_foreign_key "pre_checks", "users", column: "creator_id"
  add_foreign_key "preferences", "users"
  add_foreign_key "project_documents", "permit_projects"
  add_foreign_key "requirement_documents", "requirement_blocks"
  add_foreign_key "requirement_template_sections", "requirement_template_sections", column: "copied_from_id"
  add_foreign_key "requirement_template_sections", "requirement_templates"
  add_foreign_key "requirement_templates", "permit_classifications", column: "activity_id"
  add_foreign_key "requirement_templates", "permit_classifications", column: "permit_type_id"
  add_foreign_key "requirement_templates", "requirement_templates", column: "copied_from_id"
  add_foreign_key "requirement_templates", "site_configurations"
  add_foreign_key "requirement_templates", "users", column: "assignee_id"
  add_foreign_key "requirements", "requirement_blocks"
  add_foreign_key "resource_documents", "resources"
  add_foreign_key "resources", "jurisdictions"
  add_foreign_key "revision_reasons", "site_configurations"
  add_foreign_key "revision_requests", "submission_versions"
  add_foreign_key "revision_requests", "users"
  add_foreign_key "sandboxes", "jurisdictions"
  add_foreign_key "step_code_building_characteristics_summaries", "part_9_step_code_checklists", column: "checklist_id"
  add_foreign_key "step_code_data_entries", "part_9_step_code_checklists", column: "checklist_id"
  add_foreign_key "step_codes", "jurisdictions"
  add_foreign_key "step_codes", "permit_applications"
  add_foreign_key "step_codes", "permit_projects"
  add_foreign_key "step_codes", "users", column: "creator_id"
  add_foreign_key "submission_versions", "permit_applications"
  add_foreign_key "supporting_documents", "permit_applications"
  add_foreign_key "supporting_documents", "submission_versions"
  add_foreign_key "taggings", "tags"
  add_foreign_key "template_section_blocks", "requirement_blocks"
  add_foreign_key "template_section_blocks", "requirement_template_sections"
  add_foreign_key "template_versions", "requirement_templates"
  add_foreign_key "template_versions", "users", column: "deprecated_by_id"
  add_foreign_key "user_license_agreements", "end_user_license_agreements", column: "agreement_id"
  add_foreign_key "user_license_agreements", "users"
end
