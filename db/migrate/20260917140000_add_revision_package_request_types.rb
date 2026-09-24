class AddRevisionPackageRequestTypes < ActiveRecord::Migration[7.2]
  def change
    change_table :revision_requests, bulk: true do |t|
      t.string :type, null: false, default: "FieldRevisionRequest"
      t.string :title
    end

    change_column :revision_requests, :comment, :text

    add_column :submission_versions, :applicant_note, :text

    create_table :revision_reference_documents, id: :uuid do |t|
      t.references :revision_request,
                   null: false,
                   foreign_key: true,
                   type: :uuid
      t.jsonb :file_data
      t.string :scan_status, null: false, default: "pending"

      t.timestamps
    end

    add_index :revision_reference_documents, :scan_status
  end
end
