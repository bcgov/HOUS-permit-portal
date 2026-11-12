# frozen_string_literal: true

class ProjectMembershipPolicy < ApplicationPolicy
  # MEMBERSHIP COMMENT - currently depends on owner
  def create?
    owner_of_project?
  end

  # MEMBERSHIP COMMENT - currently depends on owner
  def reinvite?
    owner_of_project?
  end

  # MEMBERSHIP COMMENT - currently depends on owner
  def update?
    owner_of_project?
  end

  # MEMBERSHIP COMMENT - currently depends on owner
  def destroy?
    owner_of_project?
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

  # MEMBERSHIP COMMENT - currently depends on owner (PermitProjectPolicy#update?);
  # later, full-access members should also be able to manage people.
  def owner_of_project?
    project = record.permit_project
    return false unless user && project

    PermitProjectPolicy.new(user_context, project).update?
  end
end
