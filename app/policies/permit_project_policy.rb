class PermitProjectPolicy < ApplicationPolicy
  # Scope class for Pundit scopes
  class Scope < Scope
    def resolve
      # Projects the user owns OR collaborates on
      scope
        .left_joins(:collaborators)
        .where(
          "permit_projects.owner_id = :uid OR collaborators.user_id = :uid",
          uid: user.id
        )
        .distinct
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
    # User can show a project if they are the owner.
    # For now, strict ownership:
    user_is_owner?
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
