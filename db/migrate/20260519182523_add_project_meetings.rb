class AddProjectMeetings < ActiveRecord::Migration[7.2]
  def change
    add_column :site_configurations,
               :project_meetings_enabled,
               :boolean,
               default: false,
               null: false
    add_column :jurisdictions,
               :project_meetings_enabled,
               :boolean,
               default: false,
               null: false
    add_column :jurisdictions,
               :property_information_requests_enabled,
               :boolean,
               default: false,
               null: false
    add_column :preferences,
               :enable_in_app_project_meeting_submitted_notification,
               :boolean,
               default: true
    add_column :preferences,
               :enable_email_project_meeting_submitted_notification,
               :boolean,
               default: true
    add_column :users, :phone_number, :string

    create_table :project_meetings, id: :uuid do |t|
      t.references :permit_project, null: false, foreign_key: true, type: :uuid
      t.references :requested_by,
                   null: false,
                   foreign_key: {
                     to_table: :users
                   },
                   type: :uuid
      t.integer :status, default: 0, null: false
      t.integer :requester_relationship
      t.string :contact_name
      t.string :contact_email
      t.string :contact_phone_number
      t.text :project_description
      t.text :meeting_notes
      t.boolean :request_property_information
      t.datetime :submitted_at
      t.datetime :confirmed_date
      t.datetime :scheduled_at
      t.datetime :completed_at
      t.datetime :closed_at
      t.string :meeting_url

      t.timestamps
    end

    add_index :project_meetings, :status
    add_index :project_meetings, :requester_relationship
    add_index :project_meetings, :submitted_at
    add_index :project_meetings, :scheduled_at
    add_index :project_meetings, :completed_at
    add_index :project_meetings, :closed_at
    add_index :project_meetings,
              :permit_project_id,
              unique: true,
              where: "status IN (0, 1)",
              name: "index_project_meetings_on_active_permit_project"

    create_table :meeting_request_documents, id: :uuid do |t|
      t.references :project_meeting, null: false, foreign_key: true, type: :uuid
      t.integer :document_type, default: 0, null: false
      t.text :file_data
      t.string :scan_status, default: "pending", null: false

      t.timestamps
    end

    add_index :meeting_request_documents, :document_type
    add_index :meeting_request_documents, :scan_status
  end
end
