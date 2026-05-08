class HelpVideoDocumentPolicy < ApplicationPolicy
  def download?
    record.help_video.published? || user&.super_admin?
  end
end
