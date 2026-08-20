class AddCustomProjectTeams < ActiveRecord::Migration[7.2]
  def change
    # Collaborator and team permissions merge into one none/view/manage domain
    # (see ProjectTeam::COLLABORATOR_ACCESS_LEVELS). The old scale was
    # {none:0, view:1, invite:2, manage:3} for collaborator_access and
    # {none:0, view:1, manage:2} for team_access, so existing rows have to be
    # folded onto the new scale before team_access goes away: invite and manage
    # both land on manage(2), and whatever team_access granted is preserved by
    # taking the greater of the two.
    reversible { |dir| dir.up { execute(<<~SQL.squish) } }
          UPDATE project_teams
          SET collaborator_access = GREATEST(
            CASE WHEN collaborator_access >= 2 THEN 2 ELSE collaborator_access END,
            team_access
          )
        SQL

    remove_column :project_teams,
                  :team_access,
                  :integer,
                  null: false,
                  default: 0

    # A project cannot have two teams named "Plumbers".
    add_index :project_teams,
              "permit_project_id, lower(name)",
              unique: true,
              name: "index_project_teams_unique_name_per_project"

    # Explicit membership for custom teams. Joins the membership rather than the
    # user so a pending invitation can be pre-assigned to a team; it grants
    # nothing until accepted_at is set.
    create_table :project_team_memberships, id: :uuid do |t|
      t.references :project_team, null: false, foreign_key: true, type: :uuid
      t.references :project_membership,
                   null: false,
                   foreign_key: true,
                   type: :uuid

      t.timestamps
    end

    add_index :project_team_memberships,
              %i[project_team_id project_membership_id],
              unique: true,
              name: "index_project_team_memberships_unique_pair"
  end
end
