class ProjectMeetingPolicy < ApplicationPolicy
  class Scope < Scope
    def resolve
      return scope.none unless user

      clauses = [
        "permit_projects.owner_id = :uid",
        ProjectMembership.meeting_access_sql(
          project_id_sql: "permit_projects.id"
        )
      ]
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
    meetings_view? || user_is_review_staff_for_jurisdiction?
  end

  def create?
    meetings_manage? && feature_enabled?
  end

  def update?
    meetings_manage? && feature_enabled? && (record.draft? || record.active?)
  end

  def submit?
    meetings_manage? && record.draft? && feature_enabled?
  end

  def withdraw?
    meetings_manage? && feature_enabled?
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

  def create_note?
    user_is_review_staff_for_jurisdiction? && feature_enabled?
  end

  def view_notes?
    meetings_view? || user_is_review_staff_for_jurisdiction_in_active_sandbox?
  end

  def download_notes_csv?
    view_notes?
  end

  def download_calendar?
    show? && record.confirmed_date.present?
  end

  private

  def meetings_view?
    project_permissions.meetings_view?
  end

  def meetings_manage?
    project_permissions.meetings_manage?
  end

  def project_permissions
    record.permit_project&.permissions_for(user) || ProjectPermissions.none
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
