class CreateProjectDocuments < ActiveRecord::Migration[7.1]
  def change
    create_table :project_documents, id: :uuid do |t|
      t.references :permit_project, null: false, foreign_key: true, type: :uuid
      t.text :file_data # For Shrine/FileUploader
      # Add any other columns specific to project documents if needed, e.g.:
      # t.string :description
      # t.string :document_type

      t.timestamps
    end
  end
end
