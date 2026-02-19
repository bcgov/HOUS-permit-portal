class AddParcelGeometryToPermitProjects < ActiveRecord::Migration[7.2]
  def change
    unless column_exists?(:permit_projects, :parcel_geometry)
      add_column :permit_projects, :parcel_geometry, :jsonb, default: nil
    end
  end
end
