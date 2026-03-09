class AddWeatherLocationToJurisdictions < ActiveRecord::Migration[7.2]
  def change
    add_column :jurisdictions, :weather_location, :string
    add_column :jurisdictions,
               :design_summer_temp,
               :decimal,
               precision: 5,
               scale: 1
  end
end
