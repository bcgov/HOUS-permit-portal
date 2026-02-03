class ReverseMapCenterCoordinates < ActiveRecord::Migration[7.1]
  def up
    Jurisdiction.find_each do |jurisdiction|
      unless jurisdiction.map_position.is_a?(Array) &&
               jurisdiction.map_position.size == 2
        next
      end

      # Current: [lat, lng] -> New: [lng, lat] for ArcGIS
      new_position = [
        jurisdiction.map_position[1],
        jurisdiction.map_position[0]
      ]
      jurisdiction.update_columns(map_position: new_position)
    end
  end

  def down
    Jurisdiction.find_each do |jurisdiction|
      unless jurisdiction.map_position.is_a?(Array) &&
               jurisdiction.map_position.size == 2
        next
      end

      # Revert: [lng, lat] -> [lat, lng]
      new_position = [
        jurisdiction.map_position[1],
        jurisdiction.map_position[0]
      ]
      jurisdiction.update_columns(map_position: new_position)
    end
  end
end
