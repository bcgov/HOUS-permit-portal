class AddEnqueuedAtToPermitProjects < ActiveRecord::Migration[7.1]
  def change
    add_column :permit_projects, :enqueued_at, :datetime
  end
end
