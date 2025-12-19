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
    # [OVERHEATING REVIEW] Mini-lesson: roles vs *ownership*.
    # `user.submitter?` is true for every submitter account, not just the record owner.
    # As written, this can allow ANY submitter to generate PDFs for ANY PdfForm (IDOR risk).
    # Prefer: record ownership checks (record.user_id == user.id) and/or a *scoped* staff check
    # (e.g. review_staff within the right sandbox/jurisdiction), but avoid broad role gates.
    #
    # Lead note: look at `SupportingDocumentPolicy#download?` for the “house pattern”:
    # - allow submitter ownership
    # - allow review staff only when they belong to the record’s jurisdiction?
    user.present? && (record.user_id == user.id || user.submitter?)
  end

  def download?
    # [OVERHEATING REVIEW] Same concern as `generate_pdf?`: avoid broad role-based access.
    # Also consider whether download should follow the existing StorageController presigned-url flow
    # (consistent UX + avoids streaming the file through Rails).
    user.present? && (record.user_id == user.id || user.submitter?)
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
