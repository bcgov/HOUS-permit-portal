class JurisdictionBlueprint < Blueprinter::Base
  identifier :id

  view :base do
    fields :slug,
           :name,
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
           :map_zoom,
           :regional_district_name,
           :created_at,
           :submission_inbox_set_up,
           :updated_at,
           :external_api_state

    field :external_api_enabled do |jurisdiction, options|
      jurisdiction.external_api_enabled?
    end
    association :contacts, blueprint: ContactBlueprint
    association :permit_type_submission_contacts,
                blueprint: PermitTypeSubmissionContactBlueprint
    association :sandboxes, blueprint: SandboxBlueprint
    association :permit_type_required_steps,
                blueprint: PermitTypeRequiredStepBlueprint

    association :permit_type_required_steps,
                blueprint:
                  PermitTypeRequiredStepBlueprint do |jurisdiction, _options|
      jurisdiction.enabled_permit_type_required_steps
    end
  end

  view :minimal do
    fields :qualified_name, :submission_inbox_set_up, :external_api_state

    field :external_api_enabled do |jurisdiction, options|
      jurisdiction.external_api_enabled?
    end
  end
end
