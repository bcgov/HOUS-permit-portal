class RenamePdfFormsToOverheatingTools < ActiveRecord::Migration[7.2]
  def change
    rename_table :pdf_forms, :overheating_tools
    rename_column :overheating_documents, :pdf_form_id, :overheating_tool_id
  end
end
