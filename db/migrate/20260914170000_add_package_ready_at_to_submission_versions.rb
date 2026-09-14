class AddPackageReadyAtToSubmissionVersions < ActiveRecord::Migration[7.2]
  def change
    add_column :submission_versions, :package_ready_at, :datetime
  end
end
