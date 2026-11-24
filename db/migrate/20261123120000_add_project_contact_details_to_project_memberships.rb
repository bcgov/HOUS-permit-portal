class AddProjectContactDetailsToProjectMemberships < ActiveRecord::Migration[
  7.2
]
  def up
    add_column :project_memberships, :project_contact_email, :string
    add_column :project_memberships, :project_contact_phone, :string

    # Invitations no longer establish a contact designation.
    execute <<~SQL.squish
      UPDATE project_memberships
      SET contact_designation = 0
      WHERE user_id IS NULL
        AND contact_designation <> 0
    SQL
  end

  def down
    remove_column :project_memberships, :project_contact_email
    remove_column :project_memberships, :project_contact_phone
  end
end
