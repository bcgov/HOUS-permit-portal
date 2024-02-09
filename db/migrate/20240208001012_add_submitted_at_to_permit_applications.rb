class AddSubmittedAtToPermitApplications < ActiveRecord::Migration[7.1]
  def change
    add_column :permit_applications, :submitted_at, :datetime
  end
end
