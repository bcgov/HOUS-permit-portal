class CreateExternalApiKeys < ActiveRecord::Migration[7.1]
  def change
    create_table :external_api_keys, id: :uuid do |t|
      t.string :api_key, null: false, limit: 510
      t.datetime :expiration_date, null: true
      t.string :name, null: false
      t.string :webhook_url, null: true
      t.references :jurisdiction, null: false, foreign_key: true, type: :uuid

      t.timestamps
    end

    add_index :external_api_keys, :api_key, unique: true
  end
end
