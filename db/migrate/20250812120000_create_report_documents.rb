class CreateReportDocuments < ActiveRecord::Migration[7.1]
  def change
    create_table :report_documents,
                 id: :uuid,
                 default: -> { "gen_random_uuid()" } do |t|
      t.uuid :step_code_id, null: false
      t.jsonb :file_data
      t.timestamps
    end

    add_index :report_documents, :step_code_id
  end
end
