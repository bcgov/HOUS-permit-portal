class SubmissionVersionBlueprint < Blueprinter::Base
  view :base do
    identifier :id
    fields :form_json, :submission_data
    association :revision_requests, blueprint: RevisionRequestBlueprint, view: :base
  end

  view :extended do
    include_view :base
    association :revision_requests, blueprint: RevisionRequestBlueprint, view: :extended
  end
end
