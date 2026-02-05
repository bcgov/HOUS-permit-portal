class AddDiscardedAtToPermitApplications < ActiveRecord::Migration[7.2]
  def change
    add_column :permit_applications, :discarded_at, :datetime
    add_index :permit_applications, :discarded_at
  end
end
