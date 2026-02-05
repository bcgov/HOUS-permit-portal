class RenamePdfFormsToOverheatingTools < ActiveRecord::Migration[7.2]
  def up
    # Remove old foreign key BEFORE renaming the table
    if table_exists?(:overheating_documents)
      # Remove old foreign key by column name (works even after table rename)
      if foreign_key_exists?(:overheating_documents, column: :pdf_form_id)
        remove_foreign_key :overheating_documents, column: :pdf_form_id
      end
    end

    # Rename the table
    rename_table :pdf_forms, :overheating_tools

    # Then rename the column and add the new foreign key
    if table_exists?(:overheating_documents)
      # Rename the column
      rename_column :overheating_documents, :pdf_form_id, :overheating_tool_id

      # Add new foreign key
      add_foreign_key :overheating_documents, :overheating_tools
    end
  end

  def down
    # Rename table back first
    rename_table :overheating_tools, :pdf_forms

    if table_exists?(:overheating_documents)
      # Remove foreign key by column name
      if foreign_key_exists?(
           :overheating_documents,
           column: :overheating_tool_id
         )
        remove_foreign_key :overheating_documents, column: :overheating_tool_id
      end

      # Rename column back
      rename_column :overheating_documents, :overheating_tool_id, :pdf_form_id

      # Add foreign key back
      add_foreign_key :overheating_documents, :pdf_forms
    end
  end
end
