class MoveZipfileDataToSubmissionVersions < ActiveRecord::Migration[7.2]
  # Submitted apps without a submission version (should be none) lose their
  # zip when the permit_applications column drops. Drafts should have no zip.
  # jsonb is copied as-is; Shrine store objects stay at their existing path.
  def up
    add_column :submission_versions, :zipfile_data, :jsonb

    execute <<~SQL
      UPDATE submission_versions sv
      SET zipfile_data = pa.zipfile_data
      FROM permit_applications pa
      WHERE sv.permit_application_id = pa.id
        AND pa.zipfile_data IS NOT NULL
        AND sv.id = (
          SELECT sv2.id
          FROM submission_versions sv2
          WHERE sv2.permit_application_id = pa.id
          ORDER BY sv2.created_at DESC
          LIMIT 1
        )
    SQL

    remove_column :permit_applications, :zipfile_data
  end

  def down
    add_column :permit_applications, :zipfile_data, :jsonb

    execute <<~SQL
      UPDATE permit_applications pa
      SET zipfile_data = sv.zipfile_data
      FROM submission_versions sv
      WHERE sv.permit_application_id = pa.id
        AND sv.zipfile_data IS NOT NULL
        AND sv.id = (
          SELECT sv2.id
          FROM submission_versions sv2
          WHERE sv2.permit_application_id = pa.id
          ORDER BY sv2.created_at DESC
          LIMIT 1
        )
    SQL

    remove_column :submission_versions, :zipfile_data
  end
end
