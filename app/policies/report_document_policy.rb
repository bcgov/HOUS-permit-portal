class ReportDocumentPolicy < ApplicationPolicy
  def download?
    return false unless user

    record.step_code.creator == user
  end
end
