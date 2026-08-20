class AddMeetingAccessToProjectTeams < ActiveRecord::Migration[7.2]
  def change
    add_column :project_teams,
               :meeting_access,
               :integer,
               null: false,
               default: 0

    # Leads default to manage, matching AUTO_TEAM_DEFAULTS. Existing projects
    # already have their auto teams, so the column default of none would leave
    # them unable to request meetings until someone raised the team by hand.
    reversible { |dir| dir.up { execute(<<~SQL.squish) } }
          UPDATE project_teams SET meeting_access = 2 WHERE kind = 0
        SQL
  end
end
