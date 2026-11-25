class ProjectGrantPolicy < ApplicationPolicy
  # Full and Expanded assign block and application grants on this project.
  # Only Full assigns an invite grant, and only onto an Expanded member.
  def create?
    return false if own_membership?

    permitted_kind?
  end

  def destroy?
    permitted_kind?
  end

  private

  def permitted_kind?
    project = record.project_membership&.permit_project
    return false unless project

    actor = access.on(project)
    if record.block?
      actor.assign_block?
    elsif record.application?
      actor.assign_application?
    elsif record.invite?
      actor.assign_invite?
    else
      false
    end
  end

  def own_membership?
    record.project_membership&.user_id.present? &&
      record.project_membership.user_id == user&.id
  end
end
