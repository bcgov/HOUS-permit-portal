class DesignDocumentPolicy < ApplicationPolicy
  def download?
    record.pre_check.creator_id == user.id
  end
end
