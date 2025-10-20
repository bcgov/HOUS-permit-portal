class PreCheckPolicy < ApplicationPolicy
  def index?
    user.present?
  end

  def show?
    record.creator_id == user.id || permit_application_submitter?
  end

  def create?
    user.present?
  end

  def update?
    record.creator_id == user.id
  end

  def submit?
    update?
  end

  class Scope < Scope
    def resolve
      scope.where(creator_id: user.id)
    end
  end

  private

  def permit_application_submitter?
    record.permit_application&.submitter_id == user.id
  end
end
