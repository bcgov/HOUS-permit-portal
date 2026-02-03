class AddBoundaryPointsToJurisdictions < ActiveRecord::Migration[7.1]
  def change
    add_column :jurisdictions, :boundry_points, :jsonb, default: []
  end
end
