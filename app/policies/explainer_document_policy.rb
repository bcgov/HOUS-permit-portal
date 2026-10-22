class ExplainerDocumentPolicy < ApplicationPolicy
  def download?
    record.explainer&.published? || user&.super_admin?
  end
end
