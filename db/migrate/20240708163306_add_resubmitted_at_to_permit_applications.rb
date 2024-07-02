class AddResubmittedAtToPermitApplications < ActiveRecord::Migration[7.1]
  def change
    add_column :permit_applications, :resubmitted_at, :timestamp
    add_column :permit_applications, :revisions_requested_at, :timestamp
  end
end
