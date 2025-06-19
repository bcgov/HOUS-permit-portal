class AddDiscardedAtToPermitProjects < ActiveRecord::Migration[7.1]
  def change
    add_column :permit_projects, :discarded_at, :datetime
    add_index :permit_projects, :discarded_at
  end
end
