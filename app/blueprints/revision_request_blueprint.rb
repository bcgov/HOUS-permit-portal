class RevisionRequestBlueprint < Blueprinter::Base
  identifier :id
  fields :comment, :reason_code, :requirement_json, :submission_json

  association :user, blueprint: UserBlueprint, view: :base
end
