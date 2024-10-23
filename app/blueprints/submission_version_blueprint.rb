class SubmissionVersionBlueprint < Blueprinter::Base
  view :base do
    identifier :id
    fields :viewed_at, :created_at
  end

  view :extended do
    include_view :base
    fields :form_json
    field :submission_data do |submission_version, options|
      submission_version.formatted_submission_data(
        current_user: options[:current_user]
      )
    end
    association :revision_requests,
                blueprint: RevisionRequestBlueprint,
                view: :base do |submission_version, options|
      submission_version.revision_requests_for_submitter_based_on_user_permissions(
        user: options[:current_user]
      )
    end
  end

  view :review_extended do
    include_view :extended
    association :revision_requests,
                blueprint: RevisionRequestBlueprint,
                view: :extended
  end
end
