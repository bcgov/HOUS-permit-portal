class InfoDocumentFilePolicy < ApplicationPolicy
  def download?
    record.info_document.published? || user&.super_admin?
  end
end
