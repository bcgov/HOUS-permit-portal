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
           :energy_step_required,
           :zero_carbon_step_required,
           :regional_district_name,
           :created_at,
           :updated_at,
           :external_api_enabled,
           :submission_inbox_set_up

    association :contacts, blueprint: ContactBlueprint
    association :permit_type_submission_contacts, blueprint: PermitTypeSubmissionContactBlueprint
  end

  view :minimal do
    fields :qualified_name, :external_api_enabled, :submission_inbox_set_up
  end
end
