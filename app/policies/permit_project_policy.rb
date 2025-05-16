class PermitProjectPolicy < ApplicationPolicy
  # Scope class for Pundit scopes
  class Scope < Scope
    def resolve
      # Get the IDs of PermitApplications the user is allowed to see based on PermitApplicationPolicy::Scope
      # This scope is used by Pundit.policy_scope! which IS class-level.
      allowed_permit_application_ids =
        Pundit.policy_scope!(user, PermitApplication).select(:id)

      scope # This is PermitProject.all or a base scope from the controller
        .joins(:primary_permit_project_permit_application)
        .where(
          permit_project_permit_applications: {
            permit_application_id: allowed_permit_application_ids,
            is_primary: true
          }
        )
        .distinct
    end
  end

  # Assuming this is ONLY called by `apply_search_authorization` where `record` is an instance of PermitProject.
  def index?
    # Can the user see this specific project instance?
    # Delegates to your instance-based PermitApplicationPolicy#index? (or show? if you refactor PA policy)
    return false unless record.primary_permit_application.present?
    Pundit.policy!(user, record.primary_permit_application).index?
  end

  # This is for authorizing a specific project instance (e.g., in a show action).
  def show?
    return false unless record.primary_permit_application.present?
    # Delegates to your instance-based PermitApplicationPolicy#index? (or show? if you refactor PA policy)
    Pundit.policy!(user, record.primary_permit_application).index?
  end

  # Define other actions like create?, update?, destroy? as needed,
  # potentially by checking permissions on the primary_permit_application.
end
