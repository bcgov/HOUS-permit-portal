class ProjectTeamBlueprint < Blueprinter::Base
  identifier :id

  view :base do
    fields :name, :kind, :project_access, :collaborator_access, :team_access

    # Auto teams derive their members from role, so the UI cannot edit membership
    # directly. COLLAB TODO(phase 2): custom teams with explicit membership.
    field :is_auto do |project_team, _options|
      project_team.auto?
    end

    field :member_ids do |project_team, _options|
      project_team.members.pluck(:user_id)
    end
  end
end
