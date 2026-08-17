class CreateProjectMembershipsAndTeams < ActiveRecord::Migration[7.2]
  def change
    create_table :project_memberships, id: :uuid do |t|
      t.references :permit_project, null: false, foreign_key: true, type: :uuid
      t.references :user, null: false, foreign_key: true, type: :uuid
      t.references :invited_by,
                   null: true,
                   foreign_key: {
                     to_table: :users
                   },
                   type: :uuid
      t.integer :role, null: false, default: 0
      t.datetime :discarded_at

      t.timestamps
    end

    add_index :project_memberships, :discarded_at
    add_index :project_memberships,
              %i[permit_project_id user_id],
              unique: true,
              where: "discarded_at IS NULL",
              name: "index_project_memberships_unique_kept_per_project"

    create_table :project_teams, id: :uuid do |t|
      t.references :permit_project, null: false, foreign_key: true, type: :uuid
      t.string :name, null: false
      t.integer :kind, null: false, default: 3
      t.integer :project_access, null: false, default: 0
      t.integer :collaborator_access, null: false, default: 0
      t.integer :team_access, null: false, default: 0

      t.timestamps
    end

    # Auto teams (leads/contributors/all_members) are singletons per project;
    # custom teams (kind 3) are unconstrained.
    add_index :project_teams,
              %i[permit_project_id kind],
              unique: true,
              where: "kind < 3",
              name: "index_project_teams_unique_auto_team_per_project"
  end
end
