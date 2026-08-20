# frozen_string_literal: true

class CreateAutoTeamsForExistingProjects < ActiveRecord::Migration[7.2]
  def up
    Searchkick.callbacks(false) do
      PermitProject.find_each do |permit_project|
        existing_kinds = permit_project.project_teams.pluck(:kind)

        ProjectTeam::AUTO_TEAM_DEFAULTS.each do |kind, attributes|
          next if existing_kinds.include?(kind.to_s)

          permit_project.project_teams.create!(attributes.merge(kind: kind))
        end
      end
    end

    # readable_user_ids is derived from teams, so the index has to catch up.
    PermitProject.reindex
  end

  def down
    ProjectTeam.where.not(kind: :custom).delete_all
    PermitProject.reindex
  end
end
