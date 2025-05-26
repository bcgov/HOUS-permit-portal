class CommunityDocumentPolicy < ApplicationPolicy
  def download?
    true # Any user can download a community document
  end
end
