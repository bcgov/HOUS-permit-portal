class AddNewlySubmittedAtToPermitApplications < ActiveRecord::Migration[7.1]
  def change
    add_column :permit_applications, :newly_submitted_at, :timestamp
  end
end
