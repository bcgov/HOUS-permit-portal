class CreateInfoDocuments < ActiveRecord::Migration[7.2]
  def change
    create_table :info_documents, id: :uuid do |t|
      t.string :title, null: false
      t.string :description
      t.integer :sort_order, null: false, default: 0
      t.datetime :published_at

      t.timestamps
    end

    add_index :info_documents, :sort_order
    add_index :info_documents, :published_at

    create_table :info_document_files, id: :uuid do |t|
      t.references :info_document,
                   null: false,
                   foreign_key: true,
                   type: :uuid,
                   index: {
                     unique: true
                   }
      t.jsonb :file_data
      t.string :scan_status, null: false, default: "pending"

      t.timestamps
    end

    add_index :info_document_files, :scan_status

    add_column :site_configurations, :info_documents_intro_text, :text
  end
end
