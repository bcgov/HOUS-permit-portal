class ProjectMeetingPolicy < ApplicationPolicy
  def show?
    user_is_owner? || user_is_review_staff_for_jurisdiction?
  end

  def create?
    user_is_owner? && feature_enabled?
  end

  def update?
    user_is_owner? && record.draft? && feature_enabled?
  end

  def submit?
    update?
  end

  def transition_status?
    user_is_review_staff_for_jurisdiction? && feature_enabled? &&
      record.allowed_manual_transitions.any?
  end

  private

  def user_is_owner?
    user.present? && record.permit_project.owner_id == user.id
  end

  def user_is_review_staff_for_jurisdiction?
    user&.review_staff? &&
      user.member_of?(record.permit_project.jurisdiction_id)
  end

  def feature_enabled?
    record.feature_enabled?
  end
end
