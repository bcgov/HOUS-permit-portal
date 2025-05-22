class PermitProjectPolicy < ApplicationPolicy
  # Scope class for Pundit scopes
  class Scope < Scope
    def resolve
      # Option 1: User can only see projects they own.
      scope.where(owner_id: user.id)

      # Option 2: User can see projects they own OR projects where they have access to at least one item.
      # This is more complex and requires joining through project_memberships and checking item policies.
      # For strict ownership as requested, Option 1 is simpler.
      # If you need Option 2, the logic would be similar to the previous scope but combined with an OR owner_id = user.id clause.
    end
  end

  # Check if the user can index/list projects (relies on the Scope above for actual filtering)
  def index?
    user_is_owner?
  end

  # This is for authorizing a specific project instance (e.g., in a show action).
  def show?
    # User can show a project if they are the owner.
    # Additional logic: or if they can show its primary_project_item (as before)?
    # For now, strict ownership:
    user_is_owner?
  end

  def create?
    # Can any logged-in user create a project? Or specific roles?
    # Projects are currently created implicitly when a PermitApplication is created without a target_project_id.
    # The owner is set to the submitter of that application.
    # This means direct creation of a PermitProject might not be a user-facing action yet.
    # If it becomes one, this policy would be: user.present? (or role check)
    false # Placeholder: Assuming projects aren't directly created by users yet, but via PermitApplications.
  end

  def update?
    user_is_owner?
  end

  def destroy?
    user_is_owner?
  end

  private

  def user_is_owner?
    return false unless user && record # Ensure user and record exist
    record.owner_id == user.id
  end

  # user_context is still useful if you need to check policies of associated items for more granular permissions.
  def user_context
    @user_context ||= UserContext.new(user, sandbox)
  end
end
