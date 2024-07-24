class AddNotificationEmailToExternalApiKey < ActiveRecord::Migration[7.1]
  def change
    add_column :external_api_keys, :notification_email, :string, null: true
  end
end
