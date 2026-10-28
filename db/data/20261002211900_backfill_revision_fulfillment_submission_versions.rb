# frozen_string_literal: true

class BackfillRevisionFulfillmentSubmissionVersions < ActiveRecord::Migration[
  7.2
]
  def up
    SupportingDocument
      .where.not(revision_request_id: nil)
      .where(submission_version_id: nil)
      .find_each do |document|
        request_version = document.revision_request&.submission_version
        next if request_version.blank?

        versions =
          request_version
            .permit_application
            .submission_versions
            .order(:created_at)
            .to_a
        index = versions.index { |version| version.id == request_version.id }
        response_version = index && versions[index + 1]
        next if response_version.blank?

        document.update_columns(submission_version_id: response_version.id)
      end
  end

  def down
    raise ActiveRecord::IrreversibleMigration
  end
end
