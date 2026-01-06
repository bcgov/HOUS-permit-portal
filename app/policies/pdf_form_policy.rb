# frozen_string_literal: true

class PdfFormPolicy < ApplicationPolicy
  def index?
    user.present?
  end

  def create?
    user.present?
  end

  def show?
    user.present? && (record.user_id == user.id || user.review_staff?)
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

    user.review_staff? && record.respond_to?(:jurisdiction_id) &&
      user.member_of?(record.jurisdiction_id)
  end

  def download?
    return false if user.blank?

    return true if record.user_id == user.id

    user.review_staff? && record.respond_to?(:jurisdiction_id) &&
      user.member_of?(record.jurisdiction_id)
  end

  def archive?
    user.present? && record.user_id == user.id
  end

  class Scope < Scope
    def resolve
      # [OVERHEATING AUDIT] The review staff should only be able to see their own jurisdiction's pdf forms

      user.review_staff? ? scope.all : scope.where(user_id: user.id)
    end
  end
end
