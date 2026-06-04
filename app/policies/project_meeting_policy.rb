class ProjectMeetingPolicy < ApplicationPolicy
  class Scope < Scope
    def resolve
      return scope.none unless user

      clauses = ["permit_projects.owner_id = :uid"]
      values = { uid: user.id }

      if user.review_staff?
        # NOTE: This will have to be updated if review staff can ever create meeting requests
        review_clauses = [
          "permit_projects.jurisdiction_id IN (:jur_ids)",
          "project_meetings.status != :draft_status"
        ]
        if sandbox.present?
          review_clauses << "permit_projects.sandbox_id = :sandbox_id"
        end

        clauses << review_clauses.join(" AND ")
        values[:jur_ids] = user.jurisdictions.pluck(:id)
        values[:draft_status] = ProjectMeeting.statuses[:draft]
        values[:sandbox_id] = sandbox.id if sandbox.present?
      end

      scope
        .joins(:permit_project)
        .where(clauses.map { |clause| "(#{clause})" }.join(" OR "), values)
        .distinct
    end
  end

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

  def cancel?
    user_is_owner? && feature_enabled?
  end

  def transition_status?
    user_is_review_staff_for_jurisdiction? && feature_enabled? &&
      record.allowed_manual_transitions.any?
  end

  def mark_as_viewed?
    user_is_review_staff_for_jurisdiction? && feature_enabled?
  end

  def mark_as_unviewed?
    mark_as_viewed?
  end

  private

  def user_is_owner?
    user.present? && record.owner&.id == user.id
  end

  def user_is_review_staff_for_jurisdiction?
    user&.review_staff? && user.member_of?(record.jurisdiction_id) &&
      !record.draft?
  end

  def feature_enabled?
    record.feature_enabled?
  end
end
