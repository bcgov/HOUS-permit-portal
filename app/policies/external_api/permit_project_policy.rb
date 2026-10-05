class ExternalApi::PermitProjectPolicy < ExternalApi::ApplicationPolicy
  def show?
    same_jurisdiction_and_sandbox? && visible_children?
  end

  private

  def visible_children?
    record.permit_applications.kept.submitted_at_least_once.exists?
  end
end
