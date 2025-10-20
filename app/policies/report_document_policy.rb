class ReportDocumentPolicy < ApplicationPolicy
  def download?
    return false unless user

    record.step_code.creator == user
  end

  def share?
    # Only the creator of the step code can share the report
    return false unless user

    record.step_code.creator == user
  end
end
