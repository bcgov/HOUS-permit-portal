class RevisionReasonBlueprint < Blueprinter::Base
  identifier :id

  fields :reason_code, :description, :discarded_at

  view :external_api do
    fields :reason_code, :description
    exclude :discarded_at
  end
end
