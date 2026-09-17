class SupportingInformationRequestBlueprint < Blueprinter::Base
  identifier :id

  view :base do
    fields :title, :comment, :created_at, :addressed_at
    association :project_documents, blueprint: ProjectDocumentBlueprint
  end

  view :extended do
    include_view :base
    association :user, blueprint: UserBlueprint, view: :minimal
  end
end
