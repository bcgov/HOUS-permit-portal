class RevisionReasonBlueprint < Blueprinter::Base
  identifier :id

  fields :reason_code, :description, :discarded_at
end
