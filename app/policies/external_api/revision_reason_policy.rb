class ExternalApi::RevisionReasonPolicy < ExternalApi::ApplicationPolicy
  def index?
    true
  end
end
