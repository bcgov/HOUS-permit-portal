class JurisdictionBlueprint < Blueprinter::Base
  field :slug, name: :id
  fields :name,
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
         :templates_used_size,
         :map_position,
         :energy_step_required,
         :zero_carbon_step_required,
         :created_at,
         :updated_at

  association :contacts, blueprint: ContactBlueprint
  association :permit_type_submission_contacts, blueprint: PermitTypeSubmissionContactBlueprint
end
