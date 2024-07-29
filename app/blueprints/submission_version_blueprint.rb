class SubmissionVersionBlueprint < Blueprinter::Base
  view :base do
    identifier :id
    fields :viewed_at, :created_at
  end

  view :extended do
    include_view :base
    fields :form_json, :submission_data
    association :revision_requests, blueprint: RevisionRequestBlueprint, view: :base
  end

  view :review_extended do
    include_view :extended
    association :revision_requests, blueprint: RevisionRequestBlueprint, view: :extended
  end
end
