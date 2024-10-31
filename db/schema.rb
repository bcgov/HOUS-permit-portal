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

ActiveRecord::Schema[7.1].define(version: 2024_10_31_235633) do
  # These are extensions that must be enabled in order to support this database
  enable_extension "pgcrypto"
  enable_extension "plpgsql"

  create_table "allowlisted_jwts",
               id: :uuid,
               default: -> { "gen_random_uuid()" },
               force: :cascade do |t|
    t.string "jti", null: false
    t.string "aud"
    t.datetime "exp", null: false
    t.uuid "user_id", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["jti"], name: "index_allowlisted_jwts_on_jti", unique: true
    t.index ["user_id"], name: "index_allowlisted_jwts_on_user_id"
  end

  create_table "assets",
               id: :uuid,
               default: -> { "gen_random_uuid()" },
               force: :cascade do |t|
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
  end

  create_table "collaborators",
               id: :uuid,
               default: -> { "gen_random_uuid()" },
               force: :cascade do |t|
    t.uuid "user_id", null: false
    t.string "collaboratorable_type", null: false
    t.uuid "collaboratorable_id", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index %w[collaboratorable_type collaboratorable_id],
            name: "idx_on_collaboratorable_type_collaboratorable_id_aa1cca136d"
    t.index %w[collaboratorable_type collaboratorable_id],
            name: "index_collaborators_on_collaboratorable"
    t.index ["user_id"], name: "index_collaborators_on_user_id"
  end

  create_table "contacts",
               id: :uuid,
               default: -> { "gen_random_uuid()" },
               force: :cascade do |t|
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
    t.index %w[contactable_type contactable_id],
            name: "index_contacts_on_contactable"
  end

  create_table "document_references",
               id: :uuid,
               default: -> { "gen_random_uuid()" },
               force: :cascade do |t|
    t.uuid "checklist_id"
    t.string "name"
    t.string "document_name"
    t.datetime "date_issued"
    t.string "prepared_by"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["checklist_id"], name: "index_document_references_on_checklist_id"
  end

  create_table "end_user_license_agreements",
               id: :uuid,
               default: -> { "gen_random_uuid()" },
               force: :cascade do |t|
    t.text "content"
    t.boolean "active"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.integer "variant"
  end

  create_table "energy_outputs",
               id: :uuid,
               default: -> { "gen_random_uuid()" },
               force: :cascade do |t|
    t.uuid "fuel_type_id"
    t.uuid "checklist_id"
    t.integer "source"
    t.string "name"
    t.decimal "annual_energy"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["checklist_id"], name: "index_energy_outputs_on_checklist_id"
    t.index ["fuel_type_id"], name: "index_energy_outputs_on_fuel_type_id"
  end

  create_table "external_api_keys",
               id: :uuid,
               default: -> { "gen_random_uuid()" },
               force: :cascade do |t|
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
    t.index ["jurisdiction_id"],
            name: "index_external_api_keys_on_jurisdiction_id"
    t.index ["token"], name: "index_external_api_keys_on_token", unique: true
  end

  create_table "fuel_types",
               id: :uuid,
               default: -> { "gen_random_uuid()" },
               force: :cascade do |t|
    t.uuid "checklist_id"
    t.string "name"
    t.string "description"
    t.decimal "emissions_factor"
    t.string "source"
    t.decimal "ref_annual_energy"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["checklist_id"], name: "index_fuel_types_on_checklist_id"
  end

  create_table "integration_mapping_notifications",
               id: :uuid,
               default: -> { "gen_random_uuid()" },
               force: :cascade do |t|
    t.string "notifiable_type", null: false
    t.uuid "notifiable_id", null: false
    t.uuid "template_version_id", null: false
    t.string "front_end_path"
    t.datetime "processed_at"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index %w[notifiable_type notifiable_id],
            name: "index_integration_mapping_notifications_on_notifiable"
    t.index ["template_version_id"],
            name:
              "index_integration_mapping_notifications_on_template_version_id"
  end

  create_table "integration_mappings",
               id: :uuid,
               default: -> { "gen_random_uuid()" },
               force: :cascade do |t|
    t.jsonb "requirements_mapping", default: {}, null: false
    t.uuid "jurisdiction_id", null: false
    t.uuid "template_version_id", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["jurisdiction_id"],
            name: "index_integration_mappings_on_jurisdiction_id"
    t.index ["template_version_id"],
            name: "index_integration_mappings_on_template_version_id"
  end

  create_table "jurisdiction_memberships",
               id: :uuid,
               default: -> { "gen_random_uuid()" },
               force: :cascade do |t|
    t.uuid "jurisdiction_id", null: false
    t.uuid "user_id", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["jurisdiction_id"],
            name: "index_jurisdiction_memberships_on_jurisdiction_id"
    t.index ["user_id"], name: "index_jurisdiction_memberships_on_user_id"
  end

  create_table "jurisdiction_template_version_customizations",
               id: :uuid,
               default: -> { "gen_random_uuid()" },
               force: :cascade do |t|
    t.jsonb "customizations", default: {}
    t.uuid "jurisdiction_id", null: false
    t.uuid "template_version_id", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["jurisdiction_id"], name: "idx_on_jurisdiction_id_57cd0a7ea7"
    t.index ["template_version_id"],
            name: "idx_on_template_version_id_8359a99333"
  end

  create_table "jurisdictions",
               id: :uuid,
               default: -> { "gen_random_uuid()" },
               force: :cascade do |t|
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
    t.index ["prefix"], name: "index_jurisdictions_on_prefix", unique: true
    t.index ["regional_district_id"],
            name: "index_jurisdictions_on_regional_district_id"
    t.index ["slug"], name: "index_jurisdictions_on_slug", unique: true
  end

  create_table "make_up_air_fuels",
               id: :uuid,
               default: -> { "gen_random_uuid()" },
               force: :cascade do |t|
    t.uuid "fuel_type_id"
    t.uuid "checklist_id"
    t.decimal "percent_of_load"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["checklist_id"], name: "index_make_up_air_fuels_on_checklist_id"
    t.index ["fuel_type_id"], name: "index_make_up_air_fuels_on_fuel_type_id"
  end

  create_table "mechanical_energy_use_intensity_references",
               id: :uuid,
               default: -> { "gen_random_uuid()" },
               force: :cascade do |t|
    t.int4range "hdd"
    t.numrange "conditioned_space_percent"
    t.integer "step"
    t.int4range "conditioned_space_area"
    t.integer "meui"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index %w[hdd conditioned_space_percent step conditioned_space_area],
            name: "meui_composite_index",
            unique: true
  end

  create_table "occupancy_classifications",
               id: :uuid,
               default: -> { "gen_random_uuid()" },
               force: :cascade do |t|
    t.uuid "checklist_id"
    t.decimal "modelled_floor_area"
    t.integer "performance_requirement"
    t.decimal "percent_better_requirement"
    t.integer "energy_step_required"
    t.integer "zero_carbon_step_required"
    t.string "requirement_source"
    t.integer "occupancy_type"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["checklist_id"],
            name: "index_occupancy_classifications_on_checklist_id"
  end

  create_table "part_3_step_code_checklists",
               id: :uuid,
               default: -> { "gen_random_uuid()" },
               force: :cascade do |t|
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
    t.decimal "pressurized_cooridors_area"
    t.decimal "suite_heating_energy"
    t.integer "software"
    t.string "software_name"
    t.string "simulation_weather_file"
    t.decimal "above_grade_wall_area"
    t.decimal "window_to_wall_area_ratio"
    t.decimal "vertical_facade_to_floor_area_ratio"
    t.decimal "window_to_floor_area_ratio"
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
    t.decimal "sensible_recovery_efficient"
    t.integer "heating_system_plant"
    t.integer "heating_system_type"
    t.string "heating_system_description"
    t.integer "cooling_system_plant"
    t.integer "cooling_system_type"
    t.string "cooling_system_description"
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
    t.index ["step_code_id"],
            name: "index_part_3_step_code_checklists_on_step_code_id"
  end

  create_table "part_9_step_code_checklists",
               id: :uuid,
               default: -> { "gen_random_uuid()" },
               force: :cascade do |t|
    t.uuid "step_code_id"
    t.integer "stage", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
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
    t.integer "status", default: 0, null: false
    t.string "builder"
    t.uuid "step_requirement_id"
    t.integer "building_type"
    t.integer "compliance_path"
    t.string "completed_by"
    t.datetime "completed_at"
    t.string "completed_by_company"
    t.string "completed_by_phone"
    t.string "completed_by_address"
    t.string "completed_by_email"
    t.string "completed_by_service_organization"
    t.text "energy_advisor_id"
    t.decimal "hvac_consumption"
    t.decimal "dwh_heating_consumption"
    t.decimal "ref_hvac_consumption"
    t.decimal "ref_dwh_heating_consumption"
    t.integer "epc_calculation_airtightness"
    t.integer "epc_calculation_testing_target_type"
    t.boolean "epc_calculation_compliance"
    t.boolean "codeco"
    t.index ["status"], name: "index_part_9_step_code_checklists_on_status"
    t.index ["step_code_id"],
            name: "index_part_9_step_code_checklists_on_step_code_id"
    t.index ["step_requirement_id"],
            name: "index_part_9_step_code_checklists_on_step_requirement_id"
  end

  create_table "permit_applications",
               id: :uuid,
               default: -> { "gen_random_uuid()" },
               force: :cascade do |t|
    t.integer "status", default: 0
    t.uuid "submitter_id", null: false
    t.uuid "jurisdiction_id", null: false
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
    t.index ["activity_id"], name: "index_permit_applications_on_activity_id"
    t.index ["jurisdiction_id"],
            name: "index_permit_applications_on_jurisdiction_id"
    t.index ["number"],
            name: "index_permit_applications_on_number",
            unique: true
    t.index ["permit_type_id"],
            name: "index_permit_applications_on_permit_type_id"
    t.index ["submitter_id"], name: "index_permit_applications_on_submitter_id"
    t.index ["template_version_id"],
            name: "index_permit_applications_on_template_version_id"
  end

  create_table "permit_block_statuses",
               id: :uuid,
               default: -> { "gen_random_uuid()" },
               force: :cascade do |t|
    t.uuid "permit_application_id", null: false
    t.string "requirement_block_id", null: false
    t.integer "status", default: 0, null: false
    t.integer "collaboration_type", default: 0, null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index %w[permit_application_id requirement_block_id collaboration_type],
            name: "index_block_statuses_on_app_id_and_block_id_and_collab_type",
            unique: true
    t.index ["permit_application_id"],
            name: "index_permit_block_statuses_on_permit_application_id"
  end

  create_table "permit_classifications",
               id: :uuid,
               default: -> { "gen_random_uuid()" },
               force: :cascade do |t|
    t.string "name", null: false
    t.string "type", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.string "description"
    t.boolean "enabled"
    t.integer "code"
  end

  create_table "permit_collaborations",
               id: :uuid,
               default: -> { "gen_random_uuid()" },
               force: :cascade do |t|
    t.uuid "collaborator_id", null: false
    t.uuid "permit_application_id", null: false
    t.integer "collaboration_type", default: 0
    t.integer "collaborator_type", default: 0
    t.string "assigned_requirement_block_id"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["collaboration_type"],
            name: "index_permit_collaborations_on_collaboration_type"
    t.index ["collaborator_id"],
            name: "index_permit_collaborations_on_collaborator_id"
    t.index ["collaborator_type"],
            name: "index_permit_collaborations_on_collaborator_type"
    t.index %w[
              permit_application_id
              collaborator_id
              collaboration_type
              collaborator_type
              assigned_requirement_block_id
            ],
            name: "index_permit_collaborations_on_unique_columns",
            unique: true
    t.index ["permit_application_id"],
            name: "index_permit_collaborations_on_permit_application_id"
  end

  create_table "permit_type_required_steps",
               id: :uuid,
               default: -> { "gen_random_uuid()" },
               force: :cascade do |t|
    t.uuid "jurisdiction_id", null: false
    t.uuid "permit_type_id"
    t.integer "energy_step_required"
    t.integer "zero_carbon_step_required"
    t.boolean "default"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["jurisdiction_id"],
            name: "index_permit_type_required_steps_on_jurisdiction_id"
    t.index ["permit_type_id"],
            name: "index_permit_type_required_steps_on_permit_type_id"
  end

  create_table "permit_type_submission_contacts",
               id: :uuid,
               default: -> { "gen_random_uuid()" },
               force: :cascade do |t|
    t.uuid "jurisdiction_id"
    t.uuid "permit_type_id"
    t.string "confirmation_token"
    t.datetime "confirmed_at"
    t.datetime "confirmation_sent_at"
    t.string "email", null: false
    t.index ["jurisdiction_id"],
            name: "index_permit_type_submission_contacts_on_jurisdiction_id"
    t.index ["permit_type_id"],
            name: "index_permit_type_submission_contacts_on_permit_type_id"
  end

  create_table "preferences",
               id: :uuid,
               default: -> { "gen_random_uuid()" },
               force: :cascade do |t|
    t.uuid "user_id", null: false
    t.boolean "enable_in_app_new_template_version_publish_notification",
              default: true
    t.boolean "enable_email_new_template_version_publish_notification",
              default: true
    t.boolean "enable_in_app_customization_update_notification", default: true
    t.boolean "enable_email_customization_update_notification", default: true
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.boolean "enable_email_application_submission_notification", default: true
    t.boolean "enable_in_app_application_submission_notification", default: true
    t.boolean "enable_email_application_view_notification", default: true
    t.boolean "enable_in_app_application_view_notification", default: true
    t.boolean "enable_email_application_revisions_request_notification",
              default: true
    t.boolean "enable_in_app_application_revisions_request_notification",
              default: true
    t.boolean "enable_in_app_collaboration_notification", default: true
    t.boolean "enable_email_collaboration_notification", default: true
    t.boolean "enable_in_app_integration_mapping_notification", default: true
    t.boolean "enable_email_integration_mapping_notification", default: true
    t.index ["user_id"], name: "index_preferences_on_user_id"
  end

  create_table "requirement_blocks",
               id: :uuid,
               default: -> { "gen_random_uuid()" },
               force: :cascade do |t|
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
    t.index ["discarded_at"], name: "index_requirement_blocks_on_discarded_at"
    t.index %w[name first_nations],
            name: "index_requirement_blocks_on_name_and_first_nations",
            unique: true
    t.index ["sku"], name: "index_requirement_blocks_on_sku", unique: true
  end

  create_table "requirement_template_sections",
               id: :uuid,
               default: -> { "gen_random_uuid()" },
               force: :cascade do |t|
    t.string "name"
    t.uuid "requirement_template_id", null: false
    t.integer "position"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["requirement_template_id"],
            name:
              "index_requirement_template_sections_on_requirement_template_id"
  end

  create_table "requirement_templates",
               id: :uuid,
               default: -> { "gen_random_uuid()" },
               force: :cascade do |t|
    t.uuid "activity_id", null: false
    t.uuid "permit_type_id", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.string "description"
    t.datetime "discarded_at"
    t.boolean "first_nations", default: false
    t.index ["activity_id"], name: "index_requirement_templates_on_activity_id"
    t.index ["discarded_at"],
            name: "index_requirement_templates_on_discarded_at"
    t.index ["permit_type_id"],
            name: "index_requirement_templates_on_permit_type_id"
  end

  create_table "requirements",
               id: :uuid,
               default: -> { "gen_random_uuid()" },
               force: :cascade do |t|
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
    t.index ["requirement_block_id"],
            name: "index_requirements_on_requirement_block_id"
  end

  create_table "revision_reasons",
               id: :uuid,
               default: -> { "gen_random_uuid()" },
               force: :cascade do |t|
    t.string "reason_code", limit: 64
    t.string "description"
    t.uuid "site_configuration_id", null: false
    t.datetime "discarded_at"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.boolean "_discard"
    t.index ["reason_code"],
            name: "index_revision_reasons_on_reason_code",
            unique: true
    t.index ["site_configuration_id"],
            name: "index_revision_reasons_on_site_configuration_id"
  end

  create_table "revision_requests",
               id: :uuid,
               default: -> { "gen_random_uuid()" },
               force: :cascade do |t|
    t.string "reason_code", limit: 64
    t.jsonb "requirement_json"
    t.jsonb "submission_json"
    t.string "comment", limit: 350
    t.uuid "submission_version_id", null: false
    t.uuid "user_id", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["submission_version_id"],
            name: "index_revision_requests_on_submission_version_id"
    t.index ["user_id"], name: "index_revision_requests_on_user_id"
  end

  create_table "site_configurations",
               id: :uuid,
               default: -> { "gen_random_uuid()" },
               force: :cascade do |t|
    t.boolean "display_sitewide_message"
    t.text "sitewide_message"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.jsonb "help_link_items",
            default: {
              "dictionary_link_item" => {
                "href" => "",
                "show" => false,
                "title" => "Dictionary of terms",
                "description" =>
                  "See detailed explanations of terms that appear on building permits"
              },
              "user_guide_link_item" => {
                "href" => "",
                "show" => false,
                "title" => "User and role guides",
                "description" =>
                  "Step-by-step instructions on how to make the most out of the platform"
              },
              "get_started_link_item" => {
                "href" => "",
                "show" => false,
                "title" => "Get started on Building Permit Hub",
                "description" =>
                  "How to submit a building permit application through a streamlined and standardized approach across BC"
              },
              "best_practices_link_item" => {
                "href" => "",
                "show" => false,
                "title" => "Best practices",
                "description" =>
                  "How to use the Building Permit Hub efficiently for application submission"
              }
            },
            null: false
    t.jsonb "revision_reason_options"
  end

  create_table "step_code_building_characteristics_summaries",
               id: :uuid,
               default: -> { "gen_random_uuid()" },
               force: :cascade do |t|
    t.uuid "checklist_id", null: false
    t.jsonb "roof_ceilings_lines", default: [{}]
    t.jsonb "above_grade_walls_lines", default: [{}]
    t.jsonb "framings_lines", default: [{}]
    t.jsonb "unheated_floors_lines", default: [{}]
    t.jsonb "below_grade_walls_lines", default: [{}]
    t.jsonb "slabs_lines", default: [{}]
    t.jsonb "windows_glazed_doors",
            default: {
              "lines" => [{}],
              "performance_type" => "usi"
            }
    t.jsonb "doors_lines", default: [{ "performance_type" => "rsi" }]
    t.jsonb "airtightness", default: {}
    t.jsonb "space_heating_cooling_lines",
            default: [
              { "variant" => "principal" },
              { "variant" => "secondary" }
            ]
    t.jsonb "hot_water_lines", default: [{ "performance_type" => "ef" }]
    t.jsonb "ventilation_lines", default: [{}]
    t.jsonb "other_lines", default: [{}]
    t.jsonb "fossil_fuels", default: {}
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["checklist_id"], name: "idx_on_checklist_id_65832bada2"
  end

  create_table "step_code_data_entries",
               id: :uuid,
               default: -> { "gen_random_uuid()" },
               force: :cascade do |t|
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
    t.index ["checklist_id"],
            name: "index_step_code_data_entries_on_checklist_id"
  end

  create_table "step_codes",
               id: :uuid,
               default: -> { "gen_random_uuid()" },
               force: :cascade do |t|
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.uuid "permit_application_id"
    t.string "plan_author"
    t.string "plan_version"
    t.string "plan_date"
    t.string "type"
    t.index ["permit_application_id"],
            name: "index_step_codes_on_permit_application_id"
  end

  create_table "submission_versions",
               id: :uuid,
               default: -> { "gen_random_uuid()" },
               force: :cascade do |t|
    t.jsonb "form_json"
    t.jsonb "submission_data"
    t.uuid "permit_application_id", null: false
    t.datetime "viewed_at", precision: nil
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.jsonb "step_code_checklist_json", default: {}
    t.index ["permit_application_id"],
            name: "index_submission_versions_on_permit_application_id"
  end

  create_table "supporting_documents",
               id: :uuid,
               default: -> { "gen_random_uuid()" },
               force: :cascade do |t|
    t.uuid "permit_application_id", null: false
    t.jsonb "file_data"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.jsonb "compliance_data", default: {}, null: false
    t.string "data_key"
    t.uuid "submission_version_id"
    t.index ["permit_application_id"],
            name: "index_supporting_documents_on_permit_application_id"
    t.index ["submission_version_id"],
            name: "index_supporting_documents_on_submission_version_id"
  end

  create_table "taggings",
               id: :uuid,
               default: -> { "gen_random_uuid()" },
               force: :cascade do |t|
    t.uuid "tag_id"
    t.string "taggable_type"
    t.uuid "taggable_id"
    t.string "tagger_type"
    t.uuid "tagger_id"
    t.string "context", limit: 128
    t.datetime "created_at", precision: nil
    t.string "tenant", limit: 128
    t.index ["context"], name: "index_taggings_on_context"
    t.index %w[tag_id taggable_id taggable_type context tagger_id tagger_type],
            name: "taggings_idx",
            unique: true
    t.index ["tag_id"], name: "index_taggings_on_tag_id"
    t.index %w[taggable_id taggable_type context],
            name: "taggings_taggable_context_idx"
    t.index %w[taggable_id taggable_type tagger_id context],
            name: "taggings_idy"
    t.index ["taggable_id"], name: "index_taggings_on_taggable_id"
    t.index %w[taggable_type taggable_id],
            name: "index_taggings_on_taggable_type_and_taggable_id"
    t.index ["taggable_type"], name: "index_taggings_on_taggable_type"
    t.index %w[tagger_id tagger_type],
            name: "index_taggings_on_tagger_id_and_tagger_type"
    t.index ["tagger_id"], name: "index_taggings_on_tagger_id"
    t.index %w[tagger_type tagger_id],
            name: "index_taggings_on_tagger_type_and_tagger_id"
    t.index ["tenant"], name: "index_taggings_on_tenant"
  end

  create_table "tags",
               id: :uuid,
               default: -> { "gen_random_uuid()" },
               force: :cascade do |t|
    t.string "name"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.integer "taggings_count", default: 0
    t.index ["name"], name: "index_tags_on_name", unique: true
  end

  create_table "template_section_blocks",
               id: :uuid,
               default: -> { "gen_random_uuid()" },
               force: :cascade do |t|
    t.uuid "requirement_template_section_id", null: false
    t.uuid "requirement_block_id", null: false
    t.integer "position"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["requirement_block_id"],
            name: "index_template_section_blocks_on_requirement_block_id"
    t.index ["requirement_template_section_id"],
            name: "idx_on_requirement_template_section_id_5469986497"
  end

  create_table "template_versions",
               id: :uuid,
               default: -> { "gen_random_uuid()" },
               force: :cascade do |t|
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
    t.index ["deprecated_by_id"],
            name: "index_template_versions_on_deprecated_by_id"
    t.index ["requirement_template_id"],
            name: "index_template_versions_on_requirement_template_id"
  end

  create_table "thermal_energy_demand_intensity_references",
               id: :uuid,
               default: -> { "gen_random_uuid()" },
               force: :cascade do |t|
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
    t.index %w[hdd step], name: "tedi_composite_index", unique: true
  end

  create_table "user_license_agreements",
               id: :uuid,
               default: -> { "gen_random_uuid()" },
               force: :cascade do |t|
    t.uuid "user_id", null: false
    t.uuid "agreement_id", null: false
    t.datetime "accepted_at", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["agreement_id"],
            name: "index_user_license_agreements_on_agreement_id"
    t.index ["user_id"], name: "index_user_license_agreements_on_user_id"
  end

  create_table "users",
               id: :uuid,
               default: -> { "gen_random_uuid()" },
               force: :cascade do |t|
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
    t.index ["confirmation_token"],
            name: "index_users_on_confirmation_token",
            unique: true
    t.index ["discarded_at"], name: "index_users_on_discarded_at"
    t.index ["email"], name: "index_users_on_email"
    t.index ["invitation_token"],
            name: "index_users_on_invitation_token",
            unique: true
    t.index ["invited_by_id"], name: "index_users_on_invited_by_id"
    t.index %w[invited_by_type invited_by_id], name: "index_users_on_invited_by"
    t.index %w[omniauth_provider omniauth_uid],
            name: "index_users_on_omniauth_provider_and_omniauth_uid",
            unique: true
    t.index ["reset_password_token"],
            name: "index_users_on_reset_password_token",
            unique: true
  end

  add_foreign_key "allowlisted_jwts", "users", on_delete: :cascade
  add_foreign_key "collaborators", "users"
  add_foreign_key "document_references",
                  "part_3_step_code_checklists",
                  column: "checklist_id"
  add_foreign_key "energy_outputs",
                  "part_3_step_code_checklists",
                  column: "checklist_id"
  add_foreign_key "external_api_keys", "jurisdictions"
  add_foreign_key "fuel_types",
                  "part_3_step_code_checklists",
                  column: "checklist_id"
  add_foreign_key "integration_mapping_notifications", "template_versions"
  add_foreign_key "integration_mappings", "jurisdictions"
  add_foreign_key "integration_mappings", "template_versions"
  add_foreign_key "jurisdiction_memberships", "jurisdictions"
  add_foreign_key "jurisdiction_memberships", "users"
  add_foreign_key "jurisdiction_template_version_customizations",
                  "jurisdictions"
  add_foreign_key "jurisdiction_template_version_customizations",
                  "template_versions"
  add_foreign_key "jurisdictions",
                  "jurisdictions",
                  column: "regional_district_id"
  add_foreign_key "make_up_air_fuels",
                  "part_3_step_code_checklists",
                  column: "checklist_id"
  add_foreign_key "occupancy_classifications",
                  "part_3_step_code_checklists",
                  column: "checklist_id"
  add_foreign_key "part_3_step_code_checklists", "step_codes"
  add_foreign_key "part_9_step_code_checklists",
                  "permit_type_required_steps",
                  column: "step_requirement_id"
  add_foreign_key "part_9_step_code_checklists", "step_codes"
  add_foreign_key "permit_applications", "jurisdictions"
  add_foreign_key "permit_applications",
                  "permit_classifications",
                  column: "activity_id"
  add_foreign_key "permit_applications",
                  "permit_classifications",
                  column: "permit_type_id"
  add_foreign_key "permit_applications", "template_versions"
  add_foreign_key "permit_applications", "users", column: "submitter_id"
  add_foreign_key "permit_block_statuses", "permit_applications"
  add_foreign_key "permit_collaborations", "collaborators"
  add_foreign_key "permit_collaborations", "permit_applications"
  add_foreign_key "permit_type_required_steps", "jurisdictions"
  add_foreign_key "permit_type_required_steps",
                  "permit_classifications",
                  column: "permit_type_id"
  add_foreign_key "permit_type_submission_contacts", "jurisdictions"
  add_foreign_key "permit_type_submission_contacts",
                  "permit_classifications",
                  column: "permit_type_id"
  add_foreign_key "preferences", "users"
  add_foreign_key "requirement_template_sections", "requirement_templates"
  add_foreign_key "requirement_templates",
                  "permit_classifications",
                  column: "activity_id"
  add_foreign_key "requirement_templates",
                  "permit_classifications",
                  column: "permit_type_id"
  add_foreign_key "requirements", "requirement_blocks"
  add_foreign_key "revision_reasons", "site_configurations"
  add_foreign_key "revision_requests", "submission_versions"
  add_foreign_key "revision_requests", "users"
  add_foreign_key "step_code_building_characteristics_summaries",
                  "part_9_step_code_checklists",
                  column: "checklist_id"
  add_foreign_key "step_code_data_entries",
                  "part_9_step_code_checklists",
                  column: "checklist_id"
  add_foreign_key "step_codes", "permit_applications"
  add_foreign_key "submission_versions", "permit_applications"
  add_foreign_key "supporting_documents", "permit_applications"
  add_foreign_key "supporting_documents", "submission_versions"
  add_foreign_key "taggings", "tags"
  add_foreign_key "template_section_blocks", "requirement_blocks"
  add_foreign_key "template_section_blocks", "requirement_template_sections"
  add_foreign_key "template_versions", "requirement_templates"
  add_foreign_key "template_versions", "users", column: "deprecated_by_id"
  add_foreign_key "user_license_agreements",
                  "end_user_license_agreements",
                  column: "agreement_id"
  add_foreign_key "user_license_agreements", "users"
end
