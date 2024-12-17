class RequirementDocumentPolicy < ApplicationPolicy
  def download?
    true
  end

  def destroy?
    destroy?
  end

  def delete?
    destroy?
  end

  def upload?
    destroy?
  end
end
