class ExternalApi::FilePolicy < ExternalApi::ApplicationPolicy
  def create?
    true
  end
end
