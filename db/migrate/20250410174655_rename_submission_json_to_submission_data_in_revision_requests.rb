class RenameSubmissionJsonToSubmissionDataInRevisionRequests < ActiveRecord::Migration[
  7.1
]
  def change
    rename_column :revision_requests, :submission_json, :submission_data
    PermitApplication.reindex
  end
end
