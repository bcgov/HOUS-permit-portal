class CreateBuildingTypes < ActiveRecord::Migration[7.1]
  def change
    create_table :building_types, id: :uuid do |t|
      t.string :name
      t.string :description
      t.string :type
      t.string :zoning_type
      t.string :density_type
      t.timestamps
    end
  end
end
