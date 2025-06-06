class PermitProjectBlueprint < Blueprinter::Base
  identifier :id

  fields :title, :created_at, :updated_at

  view :extended do
    association :permit_applications,
                blueprint: PermitApplicationBlueprint,
                view: :base
    association :project_documents, blueprint: ProjectDocumentBlueprint
  end
end
