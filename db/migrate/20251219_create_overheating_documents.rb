class CreateOverheatingDocuments < ActiveRecord::Migration[7.0]
  def change
    create_table :overheating_documents, id: :uuid do |t|
      t.uuid :pdf_form_id, null: false
      t.text :file_data

      t.timestamps null: false
    end

    add_index :overheating_documents, :pdf_form_id
    add_foreign_key :overheating_documents, :pdf_forms
  end
end
