class CreateOverheatingDocuments < ActiveRecord::Migration[7.0]
  def change
    create_table :overheating_documents, id: :uuid do |t|
      t.uuid :pdf_form_id, null: false
      t.text :file_data
      t.string :scan_status, null: false, default: "pending"
      # [OVERHEATING REVIEW] Mini-lesson: avoid “same change twice” migrations.
      # There is also a migration adding `scan_status` again. On a fresh DB that will fail.
      # If the goal was to add an index later, keep the column here and make the later migration
      # only add the index (or remove the later migration entirely).

      t.timestamps null: false
    end

    add_index :overheating_documents, :pdf_form_id
    add_foreign_key :overheating_documents, :pdf_forms
  end
end
