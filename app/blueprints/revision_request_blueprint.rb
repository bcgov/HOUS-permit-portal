class RevisionRequestBlueprint < Blueprinter::Base
  identifier :id

  view :base do
    fields :comment,
           :reason_code,
           :requirement_json,
           :submission_data,
           :created_at,
           :type,
           :title
    association :revision_reference_documents,
                blueprint: RevisionReferenceDocumentBlueprint
    association :supporting_documents, blueprint: SupportingDocumentBlueprint
  end

  view :extended do
    include_view :base
    association :user, blueprint: UserBlueprint, view: :minimal
  end
end
