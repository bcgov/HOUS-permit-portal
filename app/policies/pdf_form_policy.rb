# frozen_string_literal: true

class PdfFormPolicy < ApplicationPolicy
  def index?
    user.present?
  end

  def create?
    user.present?
  end

  def show?
    user.present? && (record.user_id == user.id)
  end

  def update?
    user.present? && record.user_id == user.id
  end

  def destroy?
    user.present? && record.user_id == user.id
  end

  def generate_pdf?
    return false if user.blank?

    return true if record.user_id == user.id
  end

  def download?
    return false if user.blank?

    return true if record.user_id == user.id
  end

  def archive?
    user.present? && record.user_id == user.id
  end

  class Scope < Scope
    def resolve
      if user.super_admin?
        scope.all
      elsif user.review_staff?
        scope.where(jurisdiction_id: user.jurisdiction_ids)
      else
        scope.where(user_id: user.id)
      end
    end
  end
end
