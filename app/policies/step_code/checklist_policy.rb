class StepCode::ChecklistPolicy < ApplicationPolicy
  def show?
    return false unless user
    return false unless record.step_code

    step_code = record.step_code
    parent = step_code.parent
    # The record for this policy is a Checklist. A checklist doesn't directly have a jurisdiction.
    # Assuming the jurisdiction comes from the parent PermitApplication, or the StepCode if it has one directly.
    # If parent is PermitApplication, its jurisdiction is parent.jurisdiction.
    # If parent is User or PermitProject, how is the relevant jurisdiction determined for this check?
    # For now, let's assume if the parent is a PermitApplication, we use its jurisdiction.
    # This part needs clarification if a checklist associated with a User/Project also needs a jurisdiction check.

    case parent
    when PermitApplication
      # If parent is PA, allow if submitter of PA or review staff in that PA's jurisdiction
      parent.submitter == user ||
        user.review_staff_in_jurisdiction?(parent.jurisdiction)
    when User
      # If parent is User, allow if the user is the parent
      parent == user
    when PermitProject
      # If parent is PermitProject, allow if user is owner.
      # If a jurisdiction check is needed here, we need to know how the project relates to a jurisdiction.
      parent.owner == user # Add more specific logic if needed (e.g., check project's jurisdiction if applicable)
    else
      # Unknown parent type, should not happen
      false
    end
  end

  def update?
    return false unless user # User must be present to update anything
    return false unless record.step_code # Checklist must belong to a StepCode

    step_code = record.step_code
    parent = step_code.parent # Parent will always be present due to model validation

    case parent
    when PermitApplication
      return false if parent.submitted?
      # Allow if user is the submitter of the permit application or review staff in that PA's jurisdiction
      parent.submitter == user ||
        user.review_staff_in_jurisdiction?(parent.jurisdiction)
    when User
      # Checklist is associated directly with a User
      parent == user # User can update checklists they own directly
    when PermitProject
      # Checklist is associated with a PermitProject
      parent.owner == user # || parent.collaborators.include?(user) # Example for collaborators
      # Add jurisdiction check if applicable: && user.review_staff_in_jurisdiction?(parent.some_jurisdiction_method)
    else
      # Unknown parent type, or parent is unexpectedly nil (shouldn't happen with model validation)
      false
    end
  end
end
