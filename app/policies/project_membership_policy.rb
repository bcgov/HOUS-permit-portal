# frozen_string_literal: true

class ProjectMembershipPolicy < ApplicationPolicy
  # Invite and choose access. Expanded with an invite grant cannot offer Full,
  # and cannot re-send or cancel a Full invite.
  def create?
    may_send_invite?(record)
  end

  # Re-send keeps invited_email. MembershipsController#reinvite refuses an
  # active member.
  def reinvite?
    may_send_invite?(record)
  end

  # Access and contact designation. Hard Full block, not a grant.
  # The last Full member and a pending invite are model validations.
  def update_standing?
    project_access.manage_member_standing?
  end

  def update_role_tags?
    project_access.edit_role_tags?(record)
  end

  # Canceling a pending or expired invite matches invite. Removing someone else is standing.
  # Leaving is removing your own active membership, at any access level.
  # ProjectMembership still refuses the last Full member.
  def destroy?
    return may_send_invite?(record) unless record.active?
    return true if own_membership?

    project_access.manage_member_standing?
  end

  # REVIEW STAFF PROJECT MEMBER TODO: invitations are submitter-only. Review
  # staff are not project members. A review assignment is not a membership.
  # Accept does not check sandbox, so a reviewer in another sandbox could
  # accept and then fail same_sandbox? and the overview redirect.
  # PermitProjectsController#show picks the membership :extended view before
  # the inbox view, so a staff member would lose the inbox project screen.
  # The inbox view has to win for review staff, or the URL has to name which
  # view. ProjectAccess is membership only. Policies OR a jurisdiction check
  # beside it, so a staff member would get both. Grants are Limited and
  # Expanded submitter delegation; decide whether jurisdiction powers replace
  # grants or stack with them.
  def show_invitation?
    user&.submitter?
  end

  # REVIEW STAFF PROJECT MEMBER TODO: see show_invitation?.
  def accept_invitation?
    show_invitation?
  end

  # REVIEW STAFF PROJECT MEMBER TODO: see show_invitation?.
  def decline_invitation?
    show_invitation?
  end

  private

  def project_access
    @project_access ||= access.on(record.permit_project)
  end

  def may_send_invite?(membership)
    return false unless project_access.invite_people?
    return true if project_access.invite_at_full?

    !membership.full?
  end

  def own_membership?
    record.user_id.present? && record.user_id == user&.id &&
      project_access.view_project?
  end
end
