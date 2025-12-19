class AddScanStatusToOverheatingDocuments < ActiveRecord::Migration[7.0]
  def change
    # [OVERHEATING REVIEW] Mini-lesson: migrations must be runnable from scratch.
    # `CreateOverheatingDocuments` already adds `scan_status`, so this migration will fail on a fresh DB
    # with “column already exists”. In general, avoid adding the same column in two migrations.
    #
    # Recommended fix: remove one of the additions (prefer the create-table migration), or if this was meant
    # to be a later change, don’t include `scan_status` in the original create migration.
    add_column :overheating_documents,
               :scan_status,
               :string,
               null: false,
               default: "pending"
    add_index :overheating_documents, :scan_status
  end
end
