class AddHeatingDegreeDaysToJurisdictions < ActiveRecord::Migration[7.1]
  def change
    add_column :jurisdictions, :heating_degree_days, :integer
  end
end
