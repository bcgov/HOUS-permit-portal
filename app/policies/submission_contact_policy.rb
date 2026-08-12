class SubmissionContactPolicy < ApplicationPolicy
  def index?
    privileged?
  end

  def create?
    privileged? &&
      (user.super_admin? || user.member_of?(record.jurisdiction_id))
  end

  def update?
    create?
  end

  def destroy?
    create?
  end

  private

  def privileged?
    user&.super_admin? || user&.manager?
  end

  class Scope < Scope
    def resolve
      unless user&.super_admin? || user&.manager?
        raise Pundit::NotAuthorizedError
      end

      if user.super_admin?
        scope.all
      else
        scope.where(jurisdiction_id: user.jurisdictions.select(:id))
      end
    end
  end
end
