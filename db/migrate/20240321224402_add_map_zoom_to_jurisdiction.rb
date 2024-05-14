class AddMapZoomToJurisdiction < ActiveRecord::Migration[7.1]
  def change
    add_column :jurisdictions, :map_zoom, :integer
  end
end
