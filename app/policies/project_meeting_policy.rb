class ProjectMeetingPolicy < ApplicationPolicy
  class Scope < Scope
    def resolve
      return scope.none unless user

      clauses = [ProjectAccess.member_sql(:manage_meetings?)]
      values = { uid: user.id }

      if user.review_staff?
        # NOTE: This will have to be updated if review staff can ever create meeting requests
        clauses << [
          "permit_projects.jurisdiction_id IN (:jur_ids)",
          "project_meetings.status != :draft_status"
        ].join(" AND ")
        values[:jur_ids] = user.jurisdictions.pluck(:id)
        values[:draft_status] = ProjectMeeting.statuses[:draft]
      end

      scope
        .joins(:permit_project)
        .where(permit_projects: { sandbox_id: sandbox&.id })
        .where(clauses.map { |clause| "(#{clause})" }.join(" OR "), values)
        .distinct
    end
  end

  def show?
    manages_meetings? || user_is_review_staff_for_jurisdiction?
  end

  def create?
    manages_meetings? && feature_enabled?
  end

  def update?
    manages_meetings? && feature_enabled? && (record.draft? || record.active?)
  end

  def submit?
    manages_meetings? && record.draft? && feature_enabled?
  end

  def withdraw?
    manages_meetings? && feature_enabled?
  end

  def reschedule?
    user_is_review_staff_for_jurisdiction? && feature_enabled? &&
      record.scheduled?
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

  # Review staff only. Submitters do not add meeting notes.
  def create_note?
    user_is_review_staff_for_jurisdiction? && feature_enabled?
  end

  def view_notes?
    manages_meetings? ||
      user_is_review_staff_for_jurisdiction_in_active_sandbox?
  end

  def download_notes_csv?
    view_notes?
  end

  def download_calendar?
    show? && record.confirmed_date.present?
  end

  private

  def manages_meetings?
    access.on(record.permit_project).manage_meetings?
  end

  def user_is_review_staff_for_jurisdiction?
    user_is_review_staff_for_jurisdiction_in_active_sandbox? && !record.draft?
  end

  def user_is_review_staff_for_jurisdiction_in_active_sandbox?
    user&.review_staff? && user.member_of?(record.jurisdiction_id) &&
      record.sandbox_id == sandbox&.id
  end

  def feature_enabled?
    record.feature_enabled?
  end
end
