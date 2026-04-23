class ReleaseNotePolicy < ApplicationPolicy
  def create?
    user.super_admin?
  end
end
