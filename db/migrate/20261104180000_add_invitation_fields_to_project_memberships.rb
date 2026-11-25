class AddInvitationFieldsToProjectMemberships < ActiveRecord::Migration[7.2]
  def change
    change_column_null :project_memberships, :user_id, true

    add_column :project_memberships, :invited_email, :string
    add_column :project_memberships, :invited_first_name, :string
    add_column :project_memberships, :invited_last_name, :string
    add_reference :project_memberships,
                  :invited_by,
                  foreign_key: {
                    to_table: :users
                  },
                  type: :uuid
    add_column :project_memberships, :invitation_token, :string
    add_column :project_memberships, :invitation_sent_at, :datetime
    add_column :project_memberships, :invitation_accepted_at, :datetime

    add_index :project_memberships,
              :invitation_token,
              unique: true,
              where: "invitation_token IS NOT NULL",
              name: "index_project_memberships_on_invitation_token"

    remove_index :project_memberships,
                 column: :permit_project_id,
                 unique: true,
                 where: "contact_designation = 1",
                 name: "index_project_memberships_one_primary_per_project"

    add_index :project_memberships,
              :permit_project_id,
              unique: true,
              where: "(contact_designation = 1 AND user_id IS NOT NULL)",
              name: "index_project_memberships_one_primary_per_project"

    add_index :project_memberships,
              "permit_project_id, LOWER(invited_email)",
              unique: true,
              where: "user_id IS NULL",
              name: "index_project_memberships_unique_pending_email_per_project"
  end
end
