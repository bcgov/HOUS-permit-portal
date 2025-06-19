class PermitProjectBlueprint < Blueprinter::Base
  identifier :id

  fields :title,
         :full_address,
         :forcasted_completion_date,
         :phase,
         :created_at,
         :updated_at

  association :permit_applications,
              blueprint: PermitApplicationBlueprint,
              view: :base

  view :extended do
    association :project_documents, blueprint: ProjectDocumentBlueprint
  end
end
