class AddExternalApiEnabledToJurisdiction < ActiveRecord::Migration[7.1]
  def change
    add_column :jurisdictions, :external_api_enabled, :boolean, default: false
  end
end
