class ReplaceSubmitterWithMembership < ActiveRecord::Migration[7.2]
  def up
    add_reference :permit_applications,
                  :submitter_membership,
                  type: :uuid,
                  index: true,
                  foreign_key: {
                    to_table: :project_memberships,
                    on_delete: :nullify
                  }

    # The submitter is the project owner, and that owner already has a membership.
    execute <<~SQL.squish
      UPDATE permit_applications
      SET submitter_membership_id = project_memberships.id
      FROM project_memberships
      WHERE project_memberships.permit_project_id = permit_applications.permit_project_id
        AND project_memberships.user_id = permit_applications.submitter_id
    SQL

    # The person who submitted is the application's submitter, while that
    # column still exists. Later submits record the user who called submit.
    add_reference :submission_versions,
                  :submitted_by,
                  type: :uuid,
                  index: true,
                  foreign_key: {
                    to_table: :users,
                    on_delete: :nullify
                  }

    execute <<~SQL.squish
      UPDATE submission_versions
      SET submitted_by_id = permit_applications.submitter_id
      FROM permit_applications
      WHERE permit_applications.id = submission_versions.permit_application_id
        AND permit_applications.submitter_id IS NOT NULL
    SQL

    remove_foreign_key :permit_applications, column: :submitter_id
    remove_index :permit_applications, :submitter_id
    remove_column :permit_applications, :submitter_id, :uuid
  end

  def down
    add_reference :permit_applications,
                  :submitter,
                  type: :uuid,
                  index: true,
                  foreign_key: {
                    to_table: :users
                  }

    execute <<~SQL.squish
      UPDATE permit_applications
      SET submitter_id = project_memberships.user_id
      FROM project_memberships
      WHERE project_memberships.id = permit_applications.submitter_membership_id
    SQL

    remove_foreign_key :permit_applications, column: :submitter_membership_id
    remove_index :permit_applications, :submitter_membership_id
    remove_column :permit_applications, :submitter_membership_id, :uuid

    # This migration was edited after it had already run. A database that
    # applied the earlier version has no submitted_by_id to drop.
    if column_exists?(:submission_versions, :submitted_by_id)
      remove_foreign_key :submission_versions, column: :submitted_by_id
      remove_index :submission_versions, :submitted_by_id
      remove_column :submission_versions, :submitted_by_id, :uuid
    end
  end
end
