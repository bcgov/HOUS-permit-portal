class AddIssuedAtToPermitApplications < ActiveRecord::Migration[7.2]
  def change
    add_column :permit_applications, :issued_at, :datetime
  end
end
