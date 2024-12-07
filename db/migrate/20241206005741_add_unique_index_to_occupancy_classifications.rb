class AddUniqueIndexToOccupancyClassifications < ActiveRecord::Migration[7.1]
  def change
    add_index :occupancy_classifications, %i[key checklist_id], unique: true
  end
end
