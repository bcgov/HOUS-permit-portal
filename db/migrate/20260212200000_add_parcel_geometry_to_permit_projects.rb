class AddParcelGeometryToPermitProjects < ActiveRecord::Migration[7.2]
  def change
    add_column :permit_projects, :parcel_geometry, :jsonb, default: nil
  end
end
