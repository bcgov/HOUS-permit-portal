# frozen_string_literal: true

class CreateSubmissionVersions < ActiveRecord::Migration[7.1]
  def up
    PermitApplication.submitted.each do |pa|
      pa.submission_versions.create(
        form_json: pa.form_json,
        submission_data: pa.submission_data,
        created_at: pa.submitted_at,
      )
    end
  end

  def down
    raise ActiveRecord::IrreversibleMigration
  end
end
