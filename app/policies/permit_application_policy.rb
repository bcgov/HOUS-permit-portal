class PermitApplicationPolicy < ApplicationPolicy
  def show?
    if project_permissions.project_read?
      true
    elsif user.review_staff?
      return false unless user.member_of?(record.jurisdiction.id)
      return false unless record.sandbox == sandbox

      return true unless record.new_draft?

      record.permit_project&.project_meetings&.active&.exists? == true
    end
  end

  def create?
    # Only allow creating a permit application if the user can edit the parent
    # permit project
    project_permissions.project_edit?
  end

  def mark_as_viewed?
    user.review_staff? && user.member_of?(record.jurisdiction_id)
  end

  def mark_as_unviewed?
    user.review_staff? && user.member_of?(record.jurisdiction_id)
  end

  def update?
    return false if record.discarded?

    if record.draft?
      record.submission_requirement_block_edit_permissions(
        user_id: user.id
      ).present?
    else
      user.review_staff? && user.member_of?(record.jurisdiction_id)
    end
  end

  def qa_autofill?
    return false unless ENV["VITE_QA_MODE"] == "true"
    return false unless SiteConfiguration.qa_tools_enabled?

    update?
  end

  def retrigger_submission_webhook?
    record.submitted? && update?
  end

  def download_application_json?
    user.review_staff? && user.member_of?(record.jurisdiction_id) &&
      !record.new_draft?
  end

  def update_version?
    record.draft? && project_permissions.project_edit?
  end

  def update_revision_requests?
    record.submitted? && user.review_staff?
  end

  def upload_supporting_document?
    record.draft? &&
      record.submission_requirement_block_edit_permissions(
        user_id: user.id
      ).present?
  end

  def submit?
    record.draft? ? record.submitter == user : user.review_staff?
    if record.draft?
      record.submission_requirement_block_edit_permissions(user_id: user.id) ==
        :all
    else
      user.review_staff? && user.member_of?(record.jurisdiction_id)
    end
  end

  def transition_status?
    user.review_staff? && user.member_of?(record.jurisdiction_id) &&
      record.allowed_manual_transitions.any?
  end

  def reorder?
    # this is actually a collection action and the scope is defiend separately
    user&.review_staff?
  end

  def generate_missing_pdfs?
    user.super_admin? || project_permissions.project_read? ||
      ((user.review_staff?) && user.member_of?(record.jurisdiction_id))
  end

  def download_supporting_documents_zip?
    generate_missing_pdfs?
  end

  def finalize_revision_requests?
    return false unless user.review_staff? && record.submitted?

    feature_enabled =
      SiteConfiguration.allow_designated_reviewer? &&
        record.jurisdiction.allow_designated_reviewer

    return true unless feature_enabled

    designated_reviewer = record.permit_collaborations.review.delegatee.first
    return true if designated_reviewer.nil?

    designated_reviewer.collaborator.user_id == user.id
  end

  def create_permit_collaboration?
    permit_collaboration = record

    if permit_collaboration.submission?
      permit_collaboration.permit_application.submitter == user &&
        permit_collaboration.permit_application.draft?
    elsif permit_collaboration.review?
      (user.review_staff?) &&
        user
          .jurisdictions
          .find_by(id: permit_collaboration.permit_application.jurisdiction_id)
          .present? &&
        permit_collaboration.permit_application.submitted_at_least_once?
    else
      false
    end
  end

  def remove_collaborator_collaborations?
    permit_application = record

    if permit_application.draft?
      permit_application.submitter_id == user.id
    else
      user.review_staff? && user.member_of?(permit_application.jurisdiction_id)
    end
  end

  def invite_new_collaborator?
    permit_collaboration = record

    # New collaborators (i.e new user in the system) can only be invited for submission collaborations
    return false if permit_collaboration.review?

    permit_collaboration.permit_application.submitter == user &&
      permit_collaboration.permit_application.draft?
  end

  def create_or_update_permit_block_status?
    permit_block_status = record

    if permit_block_status.submission?
      block_permissions =
        permit_block_status.permit_application.submission_requirement_block_edit_permissions(
          user_id: user.id
        )

      permit_block_status.permit_application.draft? &&
        block_permissions.present? &&
        (
          block_permissions == :all ||
            block_permissions.include?(permit_block_status.requirement_block_id)
        )
    elsif permit_block_status.review?
      (user.review_staff?) &&
        user
          .jurisdictions
          .find_by(id: permit_block_status.permit_application.jurisdiction_id)
          .present? && permit_block_status.permit_application.submitted?
    else
      false
    end
  end

  def download_application_metrics_csv?
    user.super_admin?
  end

  def destroy?
    record.draft? && project_permissions.project_edit?
  end

  def restore?
    project_permissions.project_edit?
  end

  # we may want to separate an admin update to a secondary policy

  class Scope < Scope
    def resolve
      # Identify the collaboration type used for "submission" access checks.
      submission_type =
        PermitCollaboration.collaboration_types.fetch(:submission)

      # ponytail: mirrors the legacy bridge in PermitProject#permissions_for so a
      # submission collaborator created under the old model keeps read access.
      # Remove with the phase 2 migration of collaborations onto project teams.
      legacy_collaboration_exists_sql = <<-SQL.squish
        EXISTS (
          SELECT 1 FROM permit_collaborations pc
          JOIN collaborators c ON c.id = pc.collaborator_id
          WHERE pc.permit_application_id = permit_applications.id
            AND pc.collaboration_type = :submission_type
            AND pc.discarded_at IS NULL
            AND c.user_id = :uid
        )
      SQL

      # Access rule 1: user owns the parent permit project.
      owner_exists_sql = <<-SQL.squish
        EXISTS (
          SELECT 1 FROM permit_projects pp
          WHERE pp.id = permit_applications.permit_project_id
            AND pp.owner_id = :uid
        )
      SQL

      # Base access rules (ORed together later):
      # - owner of the parent permit project
      # - team-derived read access on the parent permit project
      # - legacy submission collaborator bridge
      clauses = [
        owner_exists_sql,
        ProjectMembership.project_access_sql(
          project_id_sql: "permit_applications.permit_project_id"
        ),
        legacy_collaboration_exists_sql
      ]

      # Values for parameterized SQL.
      values = { uid: user.id, submission_type: submission_type }

      if user.review_staff?
        # Access rule 3 (review staff only):
        # user can see applications for their jurisdictions once they have
        # reached a submitted status, or while still new draft if the parent
        # project has an active meeting. In sandbox mode, the sandbox filter
        # lives on the parent project now.
        pp_clauses = [
          "pp.id = permit_applications.permit_project_id",
          "pp.jurisdiction_id IN (:jur_ids)"
        ]
        pp_clauses << "pp.sandbox_id = :sandbox_id" if sandbox.present?

        review_exists_sql = <<-SQL.squish
          EXISTS (
            SELECT 1 FROM permit_projects pp
            WHERE #{pp_clauses.join(" AND ")}
          )
        SQL

        active_meeting_exists_sql = <<-SQL.squish
          EXISTS (
            SELECT 1 FROM project_meetings pm
            WHERE pm.permit_project_id = permit_applications.permit_project_id
              AND pm.status IN (:active_meeting_statuses)
          )
        SQL

        visible_status_sql = <<-SQL.squish
          permit_applications.status IN (:visible_statuses)
          OR (
            permit_applications.status = :new_draft_status
            AND #{active_meeting_exists_sql}
          )
        SQL

        clauses << "#{review_exists_sql} AND (#{visible_status_sql})"
        values[:jur_ids] = user.jurisdictions.pluck(:id)
        values[:visible_statuses] = PermitApplication
          .kanban_statuses
          .map { |name| PermitApplication.statuses.fetch(name) }
        values[:new_draft_status] = PermitApplication.statuses.fetch(
          "new_draft"
        )
        values[:active_meeting_statuses] = ProjectMeeting.statuses.values_at(
          *ProjectMeeting.active_statuses
        )
        values[:sandbox_id] = sandbox.id if sandbox.present?
      end

      # Combine all access rules with OR and de-duplicate results.
      scope.where(clauses.map { |c| "(#{c})" }.join(" OR "), values).distinct
    end
  end

  private

  # Submitter-side access to an application is decided by the parent project's
  # effective permissions.
  def project_permissions
    permit_project =
      record.respond_to?(:permit_project) ? record.permit_project : nil

    unless user && permit_project.respond_to?(:permissions_for)
      return ProjectPermissions.none
    end

    permit_project.permissions_for(user)
  end
end
