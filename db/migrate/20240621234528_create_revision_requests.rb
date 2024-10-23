class CreateRevisionRequests < ActiveRecord::Migration[7.1]
  def change
    create_table :submission_versions, id: :uuid do |t|
      t.jsonb :form_json
      t.jsonb :submission_data
      t.references :permit_application,
                   null: false,
                   foreign_key: true,
                   type: :uuid
      t.timestamp :viewed_at

      t.timestamps
    end

    create_table :revision_requests, id: :uuid do |t|
      t.integer :reason_code
      t.jsonb :requirement_json
      t.jsonb :submission_json
      t.string :comment, limit: 350
      t.references :submission_version,
                   null: false,
                   foreign_key: true,
                   type: :uuid
      t.references :user, null: false, foreign_key: true, type: :uuid

      t.timestamps
    end

    def data
      # code agnostic retrieval of all submitted PermitApplications
      PermitApplication
        .where(status: 1)
        .each do |pa|
          pa.submission_versions.create(
            form_json: pa.form_json,
            submission_data: pa.submission_data,
            created_at: pa.submitted_at,
            viewed_at: pa.viewed_at
          )
        end

      remove_column :permit_applications, :viewed_at, :timestamp
    end
  end
end
