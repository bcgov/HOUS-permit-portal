class ProjectTeamPolicy < ApplicationPolicy
  def index?
    permissions.collaborators_view?
  end

  def show?
    permissions.collaborators_view?
  end

  def create?
    permissions.collaborators_manage?
  end

  def update?
    permissions.collaborators_manage?
  end

  # Auto teams are role-derived singletons, so only custom teams can be removed.
  def destroy?
    permissions.collaborators_manage? && record.custom?
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
