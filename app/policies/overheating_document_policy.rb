class OverheatingDocumentPolicy < ApplicationPolicy
  def create?
    user.present? && record.overheating_tool.user_id == user.id
  end

  def update?
    user.present? && record.overheating_tool.user_id == user.id
  end

  def destroy?
    user.present? && record.overheating_tool.user_id == user.id
  end

  def download?
    user.present? && (record.overheating_tool.user_id == user.id)
  end
end
