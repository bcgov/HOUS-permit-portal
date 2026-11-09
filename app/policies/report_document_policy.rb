class ReportDocumentPolicy < ApplicationPolicy
  # Only the Step Code creator (step_codes.creator_id), not everyone who can
  # view or edit the Step Code.
  def download?
    return false unless user

    record.step_code.creator == user
  end

  def share?
    return false unless user

    record.step_code.creator == user
  end
end
