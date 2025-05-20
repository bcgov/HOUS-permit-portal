class PermitProjectPolicy < ApplicationPolicy
  # Scope class for Pundit scopes
  class Scope < Scope
    def resolve
      # Get the IDs of PermitApplications the user is allowed to see based on PermitApplicationPolicy::Scope
      # This scope is used by Pundit.policy_scope! which IS class-level.
      allowed_permit_application_ids =
        Pundit.policy_scope!(
          UserContext.new(user, sandbox),
          PermitApplication
        ).select(:id)

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
    return false unless record.primary_permit_application.present?

    delegate_to_primary_application(:index?)
  end

  # This is for authorizing a specific project instance (e.g., in a show action).
  def show?
    return false unless record.primary_permit_application.present?

    delegate_to_primary_application(:show?)
  end

  private

  def delegate_to_primary_application(action)
    Pundit.policy!(user_context, record.primary_permit_application).public_send(
      action
    )
  end

  def user_context
    @user_context ||= UserContext.new(user, sandbox)
  end
end
