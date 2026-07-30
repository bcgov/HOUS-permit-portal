class CreateNoteAttachmentDocuments < ActiveRecord::Migration[7.1]
  def change
    create_table :note_attachment_documents, id: :uuid do |t|
      t.references :note, null: false, foreign_key: true, type: :uuid
      t.jsonb :file_data
      t.string :scan_status, default: "pending", null: false

      t.timestamps
    end

    add_index :note_attachment_documents, :scan_status
  end
end
