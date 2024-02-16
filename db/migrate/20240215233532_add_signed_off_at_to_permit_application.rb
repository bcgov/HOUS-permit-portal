class AddSignedOffAtToPermitApplication < ActiveRecord::Migration[7.1]
  def change
    add_column :permit_applications, :signed_off_at, :datetime
  end
end
