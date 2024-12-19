class AddDocumentTypeToDocumentReferences < ActiveRecord::Migration[7.1]
  def change
    add_column :document_references,
               :document_type,
               :integer,
               null: false,
               default: 0
    add_column :document_references,
               :document_type_description,
               :string,
               null: true
    add_column :document_references, :issued_for, :string, null: true
  end
end
