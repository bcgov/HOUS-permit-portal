class CreateRequirementDocuments < ActiveRecord::Migration[7.1]
  def change
    create_table :requirement_documents, id: :uuid do |t|
      t.references :requirement_block,
                   null: false,
                   foreign_key: true,
                   type: :uuid
      t.jsonb :file_data

      t.timestamps
    end
  end
end
