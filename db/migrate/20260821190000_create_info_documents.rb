class CreateInfoDocuments < ActiveRecord::Migration[7.2]
  def change
    create_table :info_documents, id: :uuid do |t|
      t.string :title, null: false
      # Default t.string is varchar(255); UI/model allow 256 chars (same as help_videos).
      t.string :description, limit: 256
      t.integer :sort_order, null: false, default: 0
      t.datetime :published_at
      t.jsonb :file_data
      t.string :scan_status, null: false, default: "pending"

      t.timestamps
    end

    add_index :info_documents, :sort_order
    add_index :info_documents, :published_at
    add_index :info_documents, :scan_status

    add_column :site_configurations, :info_documents_intro_text, :text
  end
end
