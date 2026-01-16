class AddScanStatusToOverheatingDocuments < ActiveRecord::Migration[7.1]
  def up
    unless index_exists?(:overheating_documents, :scan_status)
      add_index :overheating_documents, :scan_status
    end
  end

  def down
    if index_exists?(:overheating_documents, :scan_status)
      remove_index :overheating_documents, :scan_status
    end
  end
end
