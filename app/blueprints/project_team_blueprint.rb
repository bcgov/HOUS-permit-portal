class ProjectTeamBlueprint < Blueprinter::Base
  identifier :id

  view :base do
    fields :name, :kind, :project_access, :collaborator_access, :meeting_access

    # Auto teams derive their members from role; only custom teams have an
    # editable membership list.
    field :is_auto do |project_team, _options|
      project_team.auto?
    end

    # Membership ids for every kind, so the UI renders members the same way
    # regardless of how membership was derived.
    field :project_membership_ids do |project_team, _options|
      project_team.displayed_project_membership_ids
    end

    field :member_ids do |project_team, _options|
      project_team.members.pluck(:user_id)
    end
  end
end
