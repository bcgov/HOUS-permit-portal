class ProjectTeamPolicy < ApplicationPolicy
  def index?
    permissions.teams_view?
  end

  def show?
    permissions.teams_view?
  end

  def update?
    permissions.teams_manage?
  end

  private

  # Authorized either with a team or with the parent project (collection
  # actions), so accept both.
  def permissions
    permit_project =
      record.respond_to?(:permit_project) ? record.permit_project : record

    unless user && permit_project.respond_to?(:permissions_for)
      return ProjectPermissions.none
    end

    permit_project.permissions_for(user)
  end
end
