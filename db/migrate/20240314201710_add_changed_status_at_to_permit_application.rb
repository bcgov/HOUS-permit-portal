class AddChangedStatusAtToPermitApplication < ActiveRecord::Migration[7.1]
  def change
    add_column :permit_applications, :changed_status_at, :datetime
  end
end
