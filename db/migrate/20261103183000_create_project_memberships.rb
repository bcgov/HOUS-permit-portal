class CreateProjectMemberships < ActiveRecord::Migration[7.2]
  def change
    create_table :project_memberships,
                 id: :uuid,
                 default: -> { "gen_random_uuid()" } do |t|
      t.references :user, null: false, foreign_key: true, type: :uuid
      t.references :permit_project, null: false, foreign_key: true, type: :uuid
      # access: standard=0, expanded=1, full=2
      t.integer :access, null: false, default: 0
      # contact_designation: none=0, primary=1, alternate=2
      t.integer :contact_designation, null: false, default: 0
      t.timestamps
    end

    add_index :project_memberships,
              %i[user_id permit_project_id],
              unique: true,
              name: "index_project_memberships_on_user_and_project"

    add_index :project_memberships,
              :permit_project_id,
              unique: true,
              where: "contact_designation = 1",
              name: "index_project_memberships_one_primary_per_project"

    add_index :project_memberships,
              :permit_project_id,
              unique: true,
              where: "contact_designation = 2",
              name: "index_project_memberships_one_alternate_per_project"
  end
end
