class AddViewedAtToPermitProjects < ActiveRecord::Migration[7.2]
  def change
    add_column :permit_projects, :viewed_at, :datetime, null: true
  end
end
