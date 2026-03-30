class AddEnqueuedAtToPermitProjects < ActiveRecord::Migration[7.1]
  def change
    add_column :permit_projects, :enqueued_at, :datetime
    add_column :permit_applications, :enqueued_at, :datetime
  end
end
