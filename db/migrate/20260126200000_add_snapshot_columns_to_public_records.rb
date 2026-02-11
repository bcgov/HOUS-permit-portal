class AddSnapshotColumnsToPublicRecords < ActiveRecord::Migration[7.2]
  def up
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

  def down
    # Delete orphaned records (those with null foreign keys) before restoring NOT NULL constraints
    execute "DELETE FROM permit_applications WHERE submitter_id IS NULL"
    execute "DELETE FROM permit_projects WHERE owner_id IS NULL"
    execute "DELETE FROM step_codes WHERE creator_id IS NULL"
    execute "DELETE FROM pre_checks WHERE creator_id IS NULL"
    execute "DELETE FROM revision_requests WHERE user_id IS NULL"
    execute "DELETE FROM user_license_agreements WHERE user_id IS NULL"

    # Restore NOT NULL constraints
    change_column_null :permit_applications, :submitter_id, false
    change_column_null :permit_projects, :owner_id, false
    change_column_null :step_codes, :creator_id, false
    change_column_null :pre_checks, :creator_id, false
    change_column_null :revision_requests, :user_id, false
    change_column_null :user_license_agreements, :user_id, false

    # Remove orphaned_at columns
    remove_column :permit_applications, :orphaned_at
    remove_column :permit_projects, :orphaned_at
    remove_column :step_codes, :orphaned_at
    remove_column :pre_checks, :orphaned_at
    remove_column :revision_requests, :orphaned_at
    remove_column :user_license_agreements, :orphaned_at

    # Remove snapshot columns
    remove_column :permit_applications, :omniauth_username_snapshot
    remove_column :permit_applications, :first_name_snapshot
    remove_column :permit_applications, :last_name_snapshot

    remove_column :permit_projects, :omniauth_username_snapshot
    remove_column :permit_projects, :first_name_snapshot
    remove_column :permit_projects, :last_name_snapshot

    remove_column :step_codes, :omniauth_username_snapshot
    remove_column :step_codes, :first_name_snapshot
    remove_column :step_codes, :last_name_snapshot

    remove_column :pre_checks, :omniauth_username_snapshot
    remove_column :pre_checks, :first_name_snapshot
    remove_column :pre_checks, :last_name_snapshot

    remove_column :revision_requests, :omniauth_username_snapshot
    remove_column :revision_requests, :first_name_snapshot
    remove_column :revision_requests, :last_name_snapshot

    remove_column :user_license_agreements, :omniauth_username_snapshot
    remove_column :user_license_agreements, :first_name_snapshot
    remove_column :user_license_agreements, :last_name_snapshot
  end
end
