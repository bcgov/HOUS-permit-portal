class AddDeprecationReasonToTemplateVersion < ActiveRecord::Migration[7.1]
  def change
    add_column :template_versions, :deprecation_reason, :integer, null: true

    add_reference :template_versions,
                  :deprecated_by,
                  null: true,
                  foreign_key: {
                    to_table: :users
                  },
                  type: :uuid
  end
end
