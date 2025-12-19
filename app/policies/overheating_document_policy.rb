class OverheatingDocumentPolicy < ApplicationPolicy
  def download?
    user.present? && (record.pdf_form.user_id == user.id || user.review_staff?)
  end
end
