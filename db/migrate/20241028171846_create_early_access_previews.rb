class CreateEarlyAccessPreviews < ActiveRecord::Migration[7.1]
  def change
    create_table :early_access_previews, id: :uuid do |t|
      t.uuid :early_access_requirement_template_id, null: false
      t.references :previewer,
                   null: false,
                   foreign_key: {
                     to_table: :users
                   },
                   type: :uuid
      t.datetime :expires_at, null: false

      t.datetime :discarded_at

      t.timestamps
    end

    add_index :early_access_previews,
              %i[early_access_requirement_template_id previewer_id],
              unique: true,
              name:
                "index_early_access_previews_on_template_id_and_previewer_id"
  end
end
