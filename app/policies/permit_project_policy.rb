class PermitProjectPolicy < ApplicationPolicy
  class Scope < Scope
    def resolve
      collaborator_exists_sql = <<-SQL.squish
        EXISTS (
          SELECT 1 FROM collaborators c
          JOIN permit_collaborations pc ON pc.collaborator_id = c.id
          JOIN permit_applications pa ON pa.id = pc.permit_application_id
          WHERE pa.permit_project_id = permit_projects.id
            AND c.user_id = :uid
        )
      SQL

      clauses = ["permit_projects.owner_id = :uid", collaborator_exists_sql]
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
    same_sandbox? && user_is_owner_or_collaborator?
  end

  def pinned?
    index?
  end

  # This is for authorizing a specific project instance (e.g., in a show action).
  def show?
    same_sandbox? &&
      (user_is_owner_or_collaborator? || user_is_review_staff_for_jurisdiction?)
  end

  def create?
    true
  end

  def update?
    same_sandbox? && user_is_owner?
  end

  def destroy?
    same_sandbox? && user_is_owner?
  end

  def pin?
    same_sandbox? && user_is_owner_or_collaborator?
  end

  def unpin?
    same_sandbox? && user_is_owner_or_collaborator?
  end

  def search_permit_applications?
    same_sandbox? && user_is_owner_or_collaborator?
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

  # Allow bulk creation of permit applications under a project
  def create_permit_applications?
    same_sandbox? && user_is_owner?
  end

  def submission_collaborator_options?
    same_sandbox? && user_is_owner?
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
    show?
  end

  private

  def same_sandbox?
    return true if user&.super_admin?
    return true unless record.respond_to?(:sandbox)

    record.sandbox == sandbox
  end

  def user_is_owner?
    return false unless user && record # Ensure user and record exist

    record.owner_id == user.id
  end

  def user_is_owner_or_collaborator?
    return true if user_is_owner?

    record.permit_applications.any? do |app|
      app.collaborators.any? { |collaborator| collaborator.user_id == user.id }
    end
  end

  def user_is_review_staff_for_jurisdiction?
    user&.review_staff? && user.member_of?(record.jurisdiction_id)
  end

  # user_context is still useful if you need to check policies of associated items for more granular permissions.
  def user_context
    @user_context ||= UserContext.new(user, sandbox)
  end
end
