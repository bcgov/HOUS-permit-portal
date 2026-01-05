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
    # [OVERHEATING AUDIT] Mini-lesson: roles vs *ownership*.
    # Prefer: record ownership checks (record.user_id == user.id) and/or a *scoped* staff check
    # (e.g. review_staff within the right jurisdiction), but avoid broad role gates.
    # See member_of? in User class
    user.present? && (record.user_id == user.id || user.review_staff?)
  end

  def download?
    # [OVERHEATING AUDIT] Same access pattern as `generate_pdf?`.
    # If we allow review staff here, ensure it’s scoped correctly (e.g. membership in the record’s jurisdiction),
    # like `SupportingDocumentPolicy#download?`.
    user.present? && (record.user_id == user.id || user.review_staff?)
  end

  def archive?
    user.present? && record.user_id == user.id
  end

  class Scope < Scope
    def resolve
      user.review_staff? ? scope.all : scope.where(user_id: user.id)
    end
  end
end
