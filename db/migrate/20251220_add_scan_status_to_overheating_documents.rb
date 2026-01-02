class AddScanStatusToOverheatingDocuments < ActiveRecord::Migration[7.0]
  def change
    add_index :overheating_documents, :scan_status
  end
end
