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
  end
end
