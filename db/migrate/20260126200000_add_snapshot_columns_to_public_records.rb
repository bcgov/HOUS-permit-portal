class AddSnapshotColumnsToPublicRecords < ActiveRecord::Migration[7.2]
  def change
    # Add snapshot columns
    add_column :permit_applications, :omniauth_username_snapshot, :string
    add_column :permit_applications, :first_name_snapshot, :string
    add_column :permit_applications, :last_name_snapshot, :string

    add_column :permit_projects, :omniauth_username_snapshot, :string
    add_column :permit_projects, :first_name_snapshot, :string
    add_column :permit_projects, :last_name_snapshot, :string

    add_column :step_codes, :omniauth_username_snapshot, :string
    add_column :step_codes, :first_name_snapshot, :string
    add_column :step_codes, :last_name_snapshot, :string

    add_column :pre_checks, :omniauth_username_snapshot, :string
    add_column :pre_checks, :first_name_snapshot, :string
    add_column :pre_checks, :last_name_snapshot, :string

    add_column :revision_requests, :omniauth_username_snapshot, :string
    add_column :revision_requests, :first_name_snapshot, :string
    add_column :revision_requests, :last_name_snapshot, :string

    add_column :user_license_agreements, :omniauth_username_snapshot, :string
    add_column :user_license_agreements, :first_name_snapshot, :string
    add_column :user_license_agreements, :last_name_snapshot, :string

    # Add orphaned_at columns
    add_column :permit_applications, :orphaned_at, :datetime
    add_column :permit_projects, :orphaned_at, :datetime
    add_column :step_codes, :orphaned_at, :datetime
    add_column :pre_checks, :orphaned_at, :datetime
    add_column :revision_requests, :orphaned_at, :datetime
    add_column :user_license_agreements, :orphaned_at, :datetime

    # Make foreign key columns nullable to allow orphaning public records
    change_column_null :permit_applications, :submitter_id, true
    change_column_null :permit_projects, :owner_id, true
    change_column_null :step_codes, :creator_id, true
    change_column_null :pre_checks, :creator_id, true
    change_column_null :revision_requests, :user_id, true
    change_column_null :user_license_agreements, :user_id, true
  end
end
