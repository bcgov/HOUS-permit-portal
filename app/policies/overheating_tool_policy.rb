# frozen_string_literal: true

class OverheatingToolPolicy < ApplicationPolicy
  def index?
    user.present?
  end

  def create?
    user.present?
  end

  def show?
    user.present? && record.user_id == user.id
  end

  def update?
    user.present? && record.user_id == user.id
  end

  def destroy?
    user.present? && record.user_id == user.id
  end

  def generate_pdf?
    user.present? && record.user_id == user.id
  end

  def download?
    user.present? && record.user_id == user.id
  end

  def archive?
    user.present? && record.user_id == user.id
  end

  class Scope < Scope
    def resolve
      scope.where(user_id: user.id)
    end
  end
end
