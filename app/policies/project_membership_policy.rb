class ProjectMembershipPolicy < ApplicationPolicy
  def index?
    permissions.collaborators_view?
  end

  def create?
    permissions.collaborators_invite?
  end

  def reinvite?
    permissions.collaborators_invite?
  end

  def update?
    permissions.collaborators_manage?
  end

  def destroy?
    permissions.collaborators_manage?
  end

  private

  # Authorized either with a membership or with the parent project (collection
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
