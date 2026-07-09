class RemoveHeatingDegreeDaysFromJurisdictions < ActiveRecord::Migration[7.1]
  def change
    remove_column :jurisdictions, :heating_degree_days, :integer
  end
end
