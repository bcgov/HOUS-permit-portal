class AddScanStatusToOverheatingDocuments < ActiveRecord::Migration[7.0]
  def change
    add_column :overheating_documents,
               :scan_status,
               :string,
               null: false,
               default: "pending"
    add_index :overheating_documents, :scan_status
  end
end
