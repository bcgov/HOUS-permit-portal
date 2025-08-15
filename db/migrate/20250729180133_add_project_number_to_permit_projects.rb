class AddProjectNumberToPermitProjects < ActiveRecord::Migration[7.1]
  def change
    add_column :permit_projects, :project_number, :string
    add_index :permit_projects, :project_number, unique: true
  end
end
