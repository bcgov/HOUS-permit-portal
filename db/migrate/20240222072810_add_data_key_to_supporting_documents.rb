class AddDataKeyToSupportingDocuments < ActiveRecord::Migration[7.1]
  def change
    add_column :supporting_documents, :data_key, :string
  end
end
