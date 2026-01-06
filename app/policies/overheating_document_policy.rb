class OverheatingDocumentPolicy < ApplicationPolicy
  def create?
    user.present? && record.pdf_form.user_id == user.id
  end

  def update?
    user.present? && record.pdf_form.user_id == user.id
  end

  def destroy?
    user.present? && record.pdf_form.user_id == user.id
  end

  def download?
    user.present? && (record.pdf_form.user_id == user.id)
  end
end
