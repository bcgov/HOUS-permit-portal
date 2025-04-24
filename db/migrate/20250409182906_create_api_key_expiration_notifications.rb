class CreateApiKeyExpirationNotifications < ActiveRecord::Migration[7.1]
  def change
    create_table :api_key_expiration_notifications, id: :uuid do |t|
      t.references :external_api_key,
                   null: false,
                   foreign_key: true,
                   type: :uuid
      t.integer :notification_interval_days, null: false
      t.datetime :sent_at, null: false

      t.timestamps
    end

    add_index :api_key_expiration_notifications,
              %i[external_api_key_id notification_interval_days],
              unique: true,
              name:
                "idx_api_key_expiration_notifications_on_key_id_and_interval"
  end
end
