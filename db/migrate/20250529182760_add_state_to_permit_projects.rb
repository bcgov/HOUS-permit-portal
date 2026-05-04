class AddStateToPermitProjects < ActiveRecord::Migration[7.1]
  def change
    add_column :permit_projects, :state, :integer, default: 0, null: false
  end
end
