class ReleaseNotePolicy < ApplicationPolicy
  def create?
    user.super_admin?
  end

  def update?
    user.super_admin?
  end
end
