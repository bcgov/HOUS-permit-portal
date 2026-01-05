class AddScanStatusToOverheatingDocuments < ActiveRecord::Migration[7.0]
  def change
    # [OVERHEATING AUDIT] Please just consolidate this with the other migration.
    add_index :overheating_documents, :scan_status
  end
end
