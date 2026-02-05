class RenamePdfFormsToOverheatingTools < ActiveRecord::Migration[7.2]
  def up
    # First rename the table
    rename_table :pdf_forms, :overheating_tools

    # Then rename the column and update the foreign key
    if table_exists?(:overheating_documents)
      # Remove old foreign key
      if foreign_key_exists?(:overheating_documents, :pdf_forms)
        remove_foreign_key :overheating_documents, :pdf_forms
      end

      # Rename the column
      rename_column :overheating_documents, :pdf_form_id, :overheating_tool_id

      # Add new foreign key
      add_foreign_key :overheating_documents, :overheating_tools
    end
  end

  def down
    if table_exists?(:overheating_documents)
      # Remove foreign key
      if foreign_key_exists?(
           :overheating_documents,
           column: :overheating_tool_id
         )
        remove_foreign_key :overheating_documents, column: :overheating_tool_id
      end

      # Rename column back
      rename_column :overheating_documents, :overheating_tool_id, :pdf_form_id
    end

    # Rename table back BEFORE adding FK that references pdf_forms
    rename_table :overheating_tools, :pdf_forms

    if table_exists?(:overheating_documents)
      # Add foreign key back (now that pdf_forms exists)
      add_foreign_key :overheating_documents, :pdf_forms
    end
  end
end
