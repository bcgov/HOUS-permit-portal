class AddResubmittedAtToPermitApplications < ActiveRecord::Migration[7.1]
  def change
    add_column :permit_applications, :revisions_requested_at, :timestamp
    remove_column :permit_applications, :submitted_at, :timestamp
  end
end
