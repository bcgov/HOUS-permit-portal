class RemoveChangedStatusAtFromPermitApplication < ActiveRecord::Migration[7.1]
  def change
    remove_column :permit_applications, :changed_status_at, :datetime
  end
end
