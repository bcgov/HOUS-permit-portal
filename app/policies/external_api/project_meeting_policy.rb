class ExternalApi::ProjectMeetingPolicy < ExternalApi::ApplicationPolicy
  def show?
    same_jurisdiction_and_sandbox? && !record.draft?
  end

  def update?
    show?
  end
end
