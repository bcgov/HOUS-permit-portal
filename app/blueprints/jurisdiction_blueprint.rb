class JurisdictionBlueprint < Blueprinter::Base
  identifier :id

  view :base do
    fields :slug,
           :name,
           :disambiguated_name,
           :locality_type,
           :qualifier,
           :qualified_name,
           :reverse_qualified_name,
           :description_html,
           :checklist_html,
           :look_out_html,
           :contact_summary_html,
           :review_managers_size,
           :reviewers_size,
           :permit_applications_size,
           :map_position,
           :boundary_points,
           :inbox_enabled,
           :show_about_page,
           :allow_designated_reviewer,
           :map_zoom,
           :regional_district_name,
           :created_at,
           :updated_at,
           :external_api_state,
           :first_nation,
           :ltsa_matcher,
           :heating_degree_days,
           :weather_location

    field :design_summer_temp do |jurisdiction, _options|
      jurisdiction.design_summer_temp&.to_f
    end

    field :external_api_enabled do |jurisdiction, _options|
      jurisdiction.external_api_enabled?
    end

    field :submission_inbox_set_up do |jurisdiction, _options|
      jurisdiction.submission_inbox_set_up?
    end
    association :contacts, blueprint: ContactBlueprint
    association :permit_type_submission_contacts,
                blueprint: PermitTypeSubmissionContactBlueprint,
                if: ->(_field_name, jurisdiction, options) do
                  options[:current_user]&.jurisdictions&.include?(jurisdiction)
                end
    association :sandboxes, blueprint: SandboxBlueprint
    association :resources, blueprint: ResourceBlueprint
    association :permit_type_required_steps,
                blueprint: PermitTypeRequiredStepBlueprint

    association :permit_type_required_steps,
                blueprint:
                  PermitTypeRequiredStepBlueprint do |jurisdiction, _options|
      jurisdiction.enabled_permit_type_required_steps
    end
    association :part3_occupancy_required_steps,
                blueprint: Part3OccupancyRequiredStepBlueprint
    association :jurisdiction_climate_zones,
                blueprint: JurisdictionClimateZoneBlueprint
    association :service_partner_enrollments,
                blueprint: JurisdictionServicePartnerEnrollmentBlueprint
  end

  view :minimal do
    fields :qualified_name, :external_api_state, :inbox_enabled

    field :external_api_enabled do |jurisdiction, _options|
      jurisdiction.external_api_enabled?
    end

    association :service_partner_enrollments,
                blueprint: JurisdictionServicePartnerEnrollmentBlueprint
  end

  view :extended do
    # Only need these extra quereies when jurisdiciton is on user blueprint
    include_view :base

    field :unviewed_submissions_count do |jurisdiction, options|
      jurisdiction.unviewed_submissions_count(
        sandbox: options[:current_sandbox]
      )
    end

    field :unviewed_projects_count do |jurisdiction, options|
      jurisdiction.unviewed_projects_count(sandbox: options[:current_sandbox])
    end
  end
end
