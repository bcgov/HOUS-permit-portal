class AddApplicationContactToPermitApplications < ActiveRecord::Migration[7.2]
  def up
    add_reference :permit_applications,
                  :application_contact_membership,
                  type: :uuid,
                  foreign_key: {
                    to_table: :project_memberships,
                    on_delete: :nullify
                  }

    # One fill for rows that already exist. Later primary-contact changes
    # do not rewrite this column.
    execute <<~SQL.squish
      UPDATE permit_applications
      SET application_contact_membership_id = project_memberships.id
      FROM project_memberships
      WHERE permit_applications.application_contact_membership_id IS NULL
        AND permit_applications.permit_project_id = project_memberships.permit_project_id
        AND project_memberships.contact_designation = 1
        AND project_memberships.user_id IS NOT NULL
    SQL
  end

  def down
    remove_reference :permit_applications,
                     :application_contact_membership,
                     foreign_key: {
                       to_table: :project_memberships
                     }
  end
end
