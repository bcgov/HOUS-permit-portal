class AddSandboxIdToApiKey < ActiveRecord::Migration[7.1]
  def change
    add_reference :external_api_keys,
                  :sandbox,
                  foreign_key: {
                    to_table: :sandboxes
                  },
                  null: true,
                  type: :uuid
  end
end
