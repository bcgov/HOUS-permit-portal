class AddApiVersionToExternalApiKeys < ActiveRecord::Migration[7.2]
  def change
    add_column :external_api_keys,
               :api_version,
               :string,
               default: "v1",
               null: false
  end
end
