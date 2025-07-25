class CreateJurisdictionDocuments < ActiveRecord::Migration[7.1]
  def change
    create_table :jurisdiction_documents, id: :uuid do |t|
      t.references :jurisdiction, null: false, foreign_key: true, type: :uuid
      t.text :file_data

      t.timestamps
    end
  end
end
