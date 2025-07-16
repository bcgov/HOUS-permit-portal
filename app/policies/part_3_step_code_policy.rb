class Part3StepCodePolicy < ApplicationPolicy
  def create?
    true
  end

  def show?
    return false unless user

    parent = record.parent

    case parent
    when User
      parent == user
    when PermitProject
      parent.owner == user ||
        user.review_staff_in_jurisdiction?(parent.jurisdiction)
    else
      false
    end
  end
end
