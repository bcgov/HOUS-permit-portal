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

      scope.where(clauses.map { |c| "(#{c})" }.join(" OR "), values).distinct
    end
  end

  # Check if the user can index/list projects (relies on the Scope above for actual filtering)
  def index?
    user_is_owner_or_collaborator?
  end

  def pinned?
    index?
  end

  # This is for authorizing a specific project instance (e.g., in a show action).
  def show?
    # updating to allow collaborators to see projects
    # user_is_owner?
    user_is_owner_or_collaborator?
  end

  def create?
    true
  end

  def update?
    user_is_owner?
  end

  def destroy?
    user_is_owner?
  end

  def pin?
    user_is_owner_or_collaborator?
  end

  def unpin?
    user_is_owner_or_collaborator?
  end

  def search_permit_applications?
    user_is_owner_or_collaborator?
  end

  # Allow bulk creation of permit applications under a project
  def create_permit_applications?
    user_is_owner?
  end

  def submission_collaborator_options?
    user_is_owner?
  end

  def jurisdiction_options?
    # Collection action – rely on policy_scope to restrict data
    true
  end

  private

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

  # user_context is still useful if you need to check policies of associated items for more granular permissions.
  def user_context
    @user_context ||= UserContext.new(user, sandbox)
  end
end
