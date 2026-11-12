class PermitProjectPolicy < ApplicationPolicy
  class Scope < Scope
    def resolve
      # TODO: HUB-5783 legacy submission collaborators still see the project.
      collaborator_exists_sql = <<-SQL.squish
        EXISTS (
          SELECT 1 FROM collaborators c
          JOIN permit_collaborations pc ON pc.collaborator_id = c.id
          JOIN permit_applications pa ON pa.id = pc.permit_application_id
          WHERE pa.permit_project_id = permit_projects.id
            AND c.user_id = :uid
        )
      SQL

      # owner_id only identifies the project creator. The creator has a Full
      # membership like any other member.
      clauses = [
        ProjectAccess.member_sql(:view_project?),
        collaborator_exists_sql
      ]
      values = { uid: user.id }

      if user.review_staff?
        clauses << "permit_projects.jurisdiction_id IN (:jur_ids)"
        values[:jur_ids] = user.jurisdictions.pluck(:id)
      end

      relation =
        scope.where(clauses.map { |c| "(#{c})" }.join(" OR "), values).distinct
      return relation if user.super_admin?

      relation.where(sandbox_id: sandbox&.id)
    end
  end

  # Check if the user can index/list projects (relies on the Scope above for actual filtering)
  def index?
    same_sandbox? && user_is_member?
  end

  def pinned?
    index?
  end

  # This is for authorizing a specific project instance (e.g., in a show action).
  def show?
    same_sandbox? && (user_is_member? || user_is_review_staff_for_jurisdiction?)
  end

  def create?
    true
  end

  def update?
    same_sandbox? && project_access.edit_project?
  end

  # The route and UI are not wired.
  def destroy?
    same_sandbox? && project_access.archive_project?
  end

  # Not in the public grid.
  def pin?
    same_sandbox? && user_is_member?
  end

  def unpin?
    pin?
  end

  # Every member, including Standard. The row is the summary view; opening
  # an application is PermitApplicationPolicy#show?.
  def search_permit_applications?
    show?
  end

  def mark_as_viewed?
    same_sandbox? && user_is_review_staff_for_jurisdiction?
  end

  def mark_as_unviewed?
    same_sandbox? && user_is_review_staff_for_jurisdiction?
  end

  def transition_state?
    same_sandbox? && user_is_review_staff_for_jurisdiction? && !record.draft?
  end

  # Allow bulk creation of permit applications under a project.
  # Review staff may add only on a project they can see in their jurisdiction.
  def create_permit_applications?
    show? &&
      (
        project_access.add_application? ||
          user_is_review_staff_for_jurisdiction?
      )
  end

  def assign_project_review_collaborator?
    same_sandbox? && user_is_review_staff_for_jurisdiction?
  end

  def unassign_project_review_collaborator?
    same_sandbox? && user_is_review_staff_for_jurisdiction?
  end

  def reorder?
    user&.review_staff?
  end

  def jurisdiction_options?
    # Collection action – rely on policy_scope to restrict data
    true
  end

  def download_notes_csv?
    same_sandbox? &&
      (
        project_access.view_project_notes? ||
          user_is_review_staff_for_jurisdiction?
      )
  end

  private

  def same_sandbox?
    return true if user&.super_admin?
    return true unless record.respond_to?(:sandbox)

    record.sandbox == sandbox
  end

  def project_access
    @project_access ||= access.on(record)
  end

  # Review assignment is not membership. A review collaborator is review
  # staff of this jurisdiction, so show? already allows them.
  def user_is_member?
    return false unless user && record

    project_access.view_project?
  end

  def user_is_review_staff_for_jurisdiction?
    user&.review_staff? && user.member_of?(record.jurisdiction_id)
  end
end
