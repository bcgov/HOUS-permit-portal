class CreateOverheatingToolsAndDocuments < ActiveRecord::Migration[7.2]
  def change
    create_table :overheating_tools, id: :uuid do |t|
      t.references :user, null: false, foreign_key: true, type: :uuid
      t.jsonb :form_json, default: {}
      t.string :form_type
      t.jsonb :pdf_file_data
      t.integer :pdf_generation_status, default: 0, null: false
      t.string :rollup_status, null: false, default: "new_draft"
      t.datetime :discarded_at

      t.timestamps
    end

    add_index :overheating_tools, :discarded_at
    add_index :overheating_tools, :rollup_status

    create_table :overheating_documents, id: :uuid do |t|
      t.references :overheating_tool,
                   null: false,
                   foreign_key: true,
                   type: :uuid
      t.text :file_data
      t.string :scan_status, null: false, default: "pending"

      t.timestamps null: false
    end

    add_index :overheating_documents, :scan_status

    OverheatingTool.reindex
  end
end
