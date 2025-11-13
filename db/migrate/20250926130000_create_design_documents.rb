class CreateDesignDocuments < ActiveRecord::Migration[7.1]
  def change
    create_table :design_documents,
                 id: :uuid,
                 default: -> { "gen_random_uuid()" } do |t|
      t.uuid :pre_check_id, null: false
      t.text :file_data

      t.timestamps
    end

    add_index :design_documents, :pre_check_id
    add_foreign_key :design_documents, :pre_checks, column: :pre_check_id
  end
end
