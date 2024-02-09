class AddSubmissionEmailToJurisdictions < ActiveRecord::Migration[7.1]
  def change
    add_column :jurisdictions, :submission_email, :string
  end
end
