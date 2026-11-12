# frozen_string_literal: true

class ProjectMembershipPolicy < ApplicationPolicy
  # MEMBERSHIP COMMENT - currently depends on owner
  def update?
    owner_of_project?
  end

  # MEMBERSHIP COMMENT - currently depends on owner
  def destroy?
    owner_of_project?
  end

  private

  def owner_of_project?
    project = record.permit_project
    return false unless user && project

    PermitProjectPolicy.new(user_context, project).update?
  end
end
