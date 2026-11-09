# frozen_string_literal: true

class ProjectMembershipPolicy < ApplicationPolicy
  # Invite and choose access.
  def create?
    project_access.invite_people?
  end

  # Re-send keeps invited_email. MembershipsController#reinvite refuses an
  # active member.
  def reinvite?
    project_access.invite_people?
  end

  # Access and contact designation. The last Full member and the primary
  # contact are model validations.
  def update_standing?
    project_access.manage_member_standing?
  end

  def update_role_tags?
    project_access.edit_role_tags?(record)
  end

  # Canceling an invite matches invite. Removing an active member is
  # standing; ProjectMembership refuses the last Full member and the primary.
  def destroy?
    return project_access.invite_people? unless record.active?

    project_access.manage_member_standing?
  end

  # MEMBERSHIP COMMENT - submitters only. If reviewers can accept later:
  # PermitProjectsController#show selects the submitter :extended view before
  # the review inbox view, so an accepted reviewer would lose the inbox view
  # of that project. Accept also does not check sandbox, so a reviewer in
  # another sandbox could accept and then be denied on the overview redirect.
  def show_invitation?
    user&.submitter?
  end

  # MEMBERSHIP COMMENT - see show_invitation?
  def accept_invitation?
    show_invitation?
  end

  # MEMBERSHIP COMMENT - see show_invitation?
  def decline_invitation?
    show_invitation?
  end

  private

  def project_access
    @project_access ||= access.on(record.permit_project)
  end
end
