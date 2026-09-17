class AddRevisionPackageRequestTypes < ActiveRecord::Migration[7.2]
  def change
    create_table :supporting_information_requests, id: :uuid do |t|
      t.references :submission_version,
                   null: false,
                   foreign_key: true,
                   type: :uuid
      t.references :user, null: true, foreign_key: true, type: :uuid
      t.string :title, null: false
      t.text :comment
      t.string :omniauth_username_snapshot
      t.string :first_name_snapshot
      t.string :last_name_snapshot
      t.datetime :orphaned_at
      t.timestamps
    end

    create_table :additional_permit_requests, id: :uuid do |t|
      t.references :submission_version,
                   null: false,
                   foreign_key: true,
                   type: :uuid
      t.references :user, null: true, foreign_key: true, type: :uuid
      t.references :requirement_template,
                   null: false,
                   foreign_key: true,
                   type: :uuid
      t.string :name_snapshot, null: false
      t.text :comment
      t.string :omniauth_username_snapshot
      t.string :first_name_snapshot
      t.string :last_name_snapshot
      t.datetime :orphaned_at
      t.timestamps
    end

    add_index :additional_permit_requests,
              %i[submission_version_id requirement_template_id],
              unique: true,
              name: "idx_additional_permit_requests_on_sv_and_template"

    add_reference :project_documents,
                  :supporting_information_request,
                  type: :uuid,
                  foreign_key: true,
                  null: true
    add_reference :project_documents,
                  :uploaded_by,
                  type: :uuid,
                  foreign_key: {
                    to_table: :users
                  },
                  null: true
    add_column :project_documents,
               :kind,
               :string,
               null: false,
               default: "reference"
  end
end
