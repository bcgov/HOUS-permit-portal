class ExternalApi::PermitProjectPolicy < ExternalApi::ApplicationPolicy
  def show?
    same_jurisdiction_and_sandbox? && visible_children?
  end

  def update_state?
    show?
  end

  def create_permit_applications?
    show?
  end

  class Scope < Scope
    def resolve
      scope
        .kept
        .where(
          jurisdiction_id: external_api_key.jurisdiction_id,
          sandbox_id: external_api_key.sandbox_id
        )
        .where.not(state: :draft)
        .where(
          id:
            PermitApplication.kept.submitted_at_least_once.select(
              :permit_project_id
            )
        )
    end
  end

  private

  def visible_children?
    record.permit_applications.kept.submitted_at_least_once.exists?
  end
end
