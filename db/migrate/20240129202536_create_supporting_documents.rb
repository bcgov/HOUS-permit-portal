class CreateSupportingDocuments < ActiveRecord::Migration[7.1]
  def change
    create_table :supporting_documents, id: :uuid do |t|
      t.references :permit_application,
                   null: false,
                   foreign_key: true,
                   type: :uuid
      t.string :file_data

      t.timestamps
    end
  end
end
