class AddCoordinatesToPermitProjects < ActiveRecord::Migration[7.2]
  def change
    add_column :permit_projects, :latitude, :decimal, precision: 10, scale: 6
    add_column :permit_projects, :longitude, :decimal, precision: 10, scale: 6
  end
end
