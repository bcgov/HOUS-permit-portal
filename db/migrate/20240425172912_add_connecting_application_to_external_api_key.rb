class AddConnectingApplicationToExternalApiKey < ActiveRecord::Migration[7.1]
  def change
    add_column :external_api_keys, :connecting_application, :string, null: false
  end
end
