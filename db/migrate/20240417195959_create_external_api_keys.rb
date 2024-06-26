class CreateExternalApiKeys < ActiveRecord::Migration[7.1]
  def change
    create_table :external_api_keys, id: :uuid do |t|
      t.string :token, null: false, limit: 510
      t.datetime :expired_at, null: true
      t.datetime :revoked_at, null: true
      t.string :name, null: false
      t.string :webhook_url, null: true
      t.references :jurisdiction, null: false, foreign_key: true, type: :uuid

      t.timestamps
    end

    add_index :external_api_keys, :token, unique: true
  end
end
