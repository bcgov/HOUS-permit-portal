class JurisdictionBlueprint < Blueprinter::Base
  identifier :id
  fields :name,
         :qualified_name,
         :description,
         :checklist_slate_data,
         :look_out_slate_data,
         :review_managers_size,
         :reviewers_size,
         :permit_applications_size,
         :created_at,
         :updated_at

  association :contacts, blueprint: ContactBlueprint
end
