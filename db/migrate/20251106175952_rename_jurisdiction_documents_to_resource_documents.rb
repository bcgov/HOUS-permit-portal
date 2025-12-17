class RenameJurisdictionDocumentsToResourceDocuments < ActiveRecord::Migration[
  7.2
]
  def change
    # Add resource_id column
    add_reference :jurisdiction_documents,
                  :resource,
                  null: false,
                  foreign_key: true,
                  type: :uuid

    # Remove jurisdiction_id column
    remove_reference :jurisdiction_documents, :jurisdiction, type: :uuid

    # Rename the table
    rename_table :jurisdiction_documents, :resource_documents
  end
end
