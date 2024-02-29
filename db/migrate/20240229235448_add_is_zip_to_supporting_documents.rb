class AddIsZipToSupportingDocuments < ActiveRecord::Migration[7.1]
  def change
    add_column :supporting_documents, :is_zip, :boolean
  end
end
