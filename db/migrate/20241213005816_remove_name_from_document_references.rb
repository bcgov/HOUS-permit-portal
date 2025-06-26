class RemoveNameFromDocumentReferences < ActiveRecord::Migration[7.1]
  def change
    remove_column :document_references, :name, :string
  end
end
