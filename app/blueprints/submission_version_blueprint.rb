class SubmissionVersionBlueprint < Blueprinter::Base
  view :base do
    identifier :id
    fields :viewed_at, :created_at
  end

  view :extended do
    include_view :base
    fields :form_json, :submitter_note
    field :submission_data do |submission_version, options|
      submission_version.formatted_submission_data(
        current_user: options[:current_user]
      )
    end
    field :applicant_note do |submission_version, _options|
      next nil unless submission_version.request_package_visible_to_submitter?

      submission_version.applicant_note
    end
    association :revision_requests,
                blueprint: RevisionRequestBlueprint,
                view: :base do |submission_version, options|
      next [] unless submission_version.request_package_visible_to_submitter?

      submission_version.revision_requests_for_submitter_based_on_user_permissions(
        user: options[:current_user]
      )
    end
  end

  view :review_extended do
    include_view :extended
    field :applicant_note
    association :revision_requests,
                blueprint: RevisionRequestBlueprint,
                view: :extended
  end

  view :external_api_index do
    identifier :id
    fields :created_at, :package_ready_at
    field :version_number
  end

  view :external_api do
    identifier :id
    fields :created_at, :package_ready_at, :permit_application_id
    field :version_number
    field :permit_project_id do |submission_version, _options|
      submission_version.permit_application.permit_project_id
    end
    field :submission_data do |submission_version, _options|
      submission_version.permit_application.formatted_submission_data_for_external_use(
        submission_version: submission_version
      )
    end
    field :raw_h2k_files do |submission_version, _options|
      ExternalPermitApplicationService.new(
        submission_version.permit_application
      ).get_raw_h2k_files
    end
    field :generated_documents do |submission_version, _options|
      submission_version
        .supporting_documents
        .select do |doc|
          SupportingDocument::STATIC_DOCUMENT_DATA_KEYS.include?(
            doc.data_key
          ) && doc.file.present?
        end
        .map do |doc|
          {
            id: doc.id,
            name: doc.file_name,
            type: doc.file_type,
            size: doc.file_size,
            url: doc.file_url
          }
        end
    end
    field :zipfile do |submission_version, _options|
      next nil unless submission_version.zipfile_data.present?

      {
        id: submission_version.zipfile_data["id"],
        name: submission_version.zipfile_name,
        type:
          submission_version.zipfile_data.dig("metadata", "mime_type") ||
            "application/zip",
        size: submission_version.zipfile_size,
        url: submission_version.zipfile_url
      }
    end
  end
end
