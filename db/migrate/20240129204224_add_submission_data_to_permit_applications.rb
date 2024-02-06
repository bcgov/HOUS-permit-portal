class AddSubmissionDataToPermitApplications < ActiveRecord::Migration[7.1]
  def change
    add_column :permit_applications, :submission_data, :jsonb
  end
end
