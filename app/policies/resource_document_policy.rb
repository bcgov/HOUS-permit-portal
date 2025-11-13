class ResourceDocumentPolicy < ApplicationPolicy
  def download?
    true
  end
end
