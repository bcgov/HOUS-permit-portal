class AddStatusToPermitProjects < ActiveRecord::Migration[7.1]
  def change
    add_column :permit_projects, :status, :integer, default: 0, null: false
  end
end
