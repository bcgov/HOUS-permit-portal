class ExternalApi::PermitApplicationPolicy < ExternalApi::ApplicationPolicy
  def index?
    external_api_key.jurisdiction == record.jurisdiction && record.submitted? &&
      record.sandbox == sandbox
  end

  def show?
    index?
  end

  def show_integration_mapping?
    external_api_key.jurisdiction == record.jurisdiction
  end

  class Scope < Scope
    def resolve
      scope.joins(:permit_project).where(
        submitter: user,
        permit_projects: {
          sandbox_id: sandbox&.id
        }
      )
    end
  end
end
