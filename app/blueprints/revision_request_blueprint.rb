class RevisionRequestBlueprint < Blueprinter::Base
  identifier :id

  view :base do
    fields :comment, :reason_code, :requirement_json, :submission_json
  end

  view :extended do
    include_view :base
    association :user, blueprint: UserBlueprint, view: :minimal
  end
end
