class AddViewedAtToPermitApplications < ActiveRecord::Migration[7.1]
  def change
    add_column :permit_applications, :viewed_at, :datetime
  end
end
