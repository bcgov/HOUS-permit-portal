class ExternalApi::PermitApplicationPolicy < ExternalApi::ApplicationPolicy
  def index?
    external_api_key.jurisdiction == record.jurisdiction && record.submitted? &&
      record.sandbox == sandbox
  end

  def show?
    index?
  end

  def show_submission_version?
    show?
  end

  def update_status?
    index?
  end

  def show_integration_mapping?
    external_api_key.jurisdiction == record.jurisdiction
  end

  class Scope < Scope
    def resolve
      scope.joins(:permit_project).where(
        status: PermitApplication.submitted_statuses,
        permit_projects: {
          jurisdiction_id: external_api_key.jurisdiction_id,
          sandbox_id: external_api_key.sandbox_id
        }
      )
    end
  end
end
