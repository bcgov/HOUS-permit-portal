class CreateRevisionRequests < ActiveRecord::Migration[7.1]
  def change
    create_table :submission_versions, id: :uuid do |t|
      t.jsonb :form_json
      t.jsonb :submission_data
      t.references :permit_application, null: false, foreign_key: true, type: :uuid

      t.timestamps
    end

    create_table :revision_requests, id: :uuid do |t|
      t.integer :reason_code
      t.jsonb :requirement_json
      t.jsonb :submission_json
      t.string :comment, limit: 350
      t.references :submission_version, null: false, foreign_key: true, type: :uuid
      t.references :user, null: false, foreign_key: true, type: :uuid

      t.timestamps
    end

    # This needs to occur between two migrations
    # Im not sure if there is a way to accomplish this with the data_migration
    # But this seems to work completely fine
    PermitApplication.submitted.each do |pa|
      pa.submission_versions.create(
        form_json: pa.form_json,
        submission_data: pa.submission_data,
        created_at: pa.submitted_at,
      )
    end
  end
end
