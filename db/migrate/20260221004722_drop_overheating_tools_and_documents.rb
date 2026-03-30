class DropOverheatingToolsAndDocuments < ActiveRecord::Migration[7.2]
  def up
    drop_table :overheating_documents, if_exists: true
    drop_table :overheating_tools, if_exists: true
  end

  def down
    raise ActiveRecord::IrreversibleMigration
  end
end
