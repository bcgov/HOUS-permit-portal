class JurisdictionBlueprint < Blueprinter::Base
  identifier :id
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
         :created_at,
         :updated_at

  association :contacts, blueprint: ContactBlueprint
end
