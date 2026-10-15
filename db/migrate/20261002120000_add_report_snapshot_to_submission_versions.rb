class AddReportSnapshotToSubmissionVersions < ActiveRecord::Migration[7.2]
  def change
    add_column :submission_versions, :report_snapshot, :jsonb
  end
end
