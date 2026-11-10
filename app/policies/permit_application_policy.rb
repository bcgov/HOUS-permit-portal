class PermitApplicationPolicy < ApplicationPolicy
  # submitter_id and the project creator (owner_id) are not checks. Project
  # access is membership; the application creator is created_by.
  # GRANTS TODO: Standard with a grant on the application. Members follow view_application?.
  def show?
    return true if project_access.view_application?
    return false unless user.review_staff?
    return false unless user.member_of?(record.jurisdiction.id)
    return false unless record.sandbox == sandbox
    return true unless record.new_draft?

    record.permit_project&.project_meetings&.active&.exists? == true
  end

  def create?
    project = record.permit_project
    return false unless project

    PermitProjectPolicy.new(user_context, project).create_permit_applications?
  end

  def mark_as_viewed?
    user.review_staff? && user.member_of?(record.jurisdiction_id)
  end

  def mark_as_unviewed?
    user.review_staff? && user.member_of?(record.jurisdiction_id)
  end

  # GRANTS TODO: Standard with a block grant. Draft edits follow edit_application?.
  def update?
    return false if record.discarded?

    if record.draft?
      project_access.edit_application?
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

  # GRANTS TODO: Standard with a block grant. Follows edit_application?.
  def update_version?
    record.draft? && project_access.edit_application?
  end

  def update_revision_requests?
    record.submitted? && user.review_staff?
  end

  # Responding to a revision request.
  def update_submitter_note?
    record.revisions_requested? && project_access.edit_application?
  end

  def upload_revision_fulfillment?
    record.revisions_requested? && project_access.edit_application?
  end

  # GRANTS TODO: Standard with a block grant. Follows edit_application?.
  def acknowledge_published_electives?
    record.draft? && project_access.edit_application?
  end

  # GRANTS TODO: Standard with a block grant. Follows edit_application?.
  def upload_supporting_document?
    record.draft? && project_access.edit_application?
  end

  # Assigning submit to someone else is a grant (assign_submit?).
  def submit?
    record.draft? && project_access.submit_application?
  end

  def transition_status?
    user.review_staff? && user.member_of?(record.jurisdiction_id) &&
      record.allowed_manual_transitions.any?
  end

  def reorder?
    # this is actually a collection action and the scope is defiend separately
    user&.review_staff?
  end

  # GRANTS TODO: Standard with a grant on the application. Members follow view_application?.
  def generate_missing_pdfs?
    user.super_admin? || project_access.view_application? ||
      ((user.review_staff?) && user.member_of?(record.jurisdiction_id))
  end

  # GRANTS TODO: Standard with a grant on the application. Same check as generate_missing_pdfs?.
  def download_supporting_documents_zip?
    generate_missing_pdfs?
  end

  def finalize_revision_requests?
    return false unless user.review_staff? && record.submitted?

    feature_enabled =
      SiteConfiguration.allow_designated_reviewer? &&
        record.jurisdiction.allow_designated_reviewer

    return true unless feature_enabled

    designated_reviewer = record.permit_collaborations.delegatee.first
    return true if designated_reviewer.nil?

    designated_reviewer.collaborator.user_id == user.id
  end

  def create_permit_collaboration?
    permit_collaboration = record

    user.review_staff? &&
      user
        .jurisdictions
        .find_by(id: permit_collaboration.permit_application.jurisdiction_id)
        .present? &&
      permit_collaboration.permit_application.submitted_at_least_once?
  end

  def remove_collaborator_collaborations?
    permit_application = record

    user.review_staff? && user.member_of?(permit_application.jurisdiction_id) &&
      permit_application.submitted_at_least_once?
  end

  def create_or_update_permit_block_status?
    permit_block_status = record

    user.review_staff? &&
      user
        .jurisdictions
        .find_by(id: permit_block_status.permit_application.jurisdiction_id)
        .present? && permit_block_status.permit_application.submitted?
  end

  def download_application_metrics_csv?
    user.super_admin?
  end

  # Full: any draft. Expanded: only a draft they created (created_by).
  def destroy?
    record.draft? && project_access.archive_draft?(record)
  end

  def restore?
    project_access.archive_draft?(record)
  end

  # we may want to separate an admin update to a secondary policy

  class Scope < Scope
    # The project's application list. Every member, including Standard, is
    # in it; opening one is show?.
    def resolve
      resolve_for(:view_project?)
    end

    # Applications the user can open. Step Code follows this, not the list.
    def resolve_viewable
      resolve_for(:view_application?)
    end

    private

    def resolve_for(project_check)
      clauses = [
        ProjectAccess.member_sql(
          project_check,
          "permit_applications.permit_project_id"
        )
      ]
      values = { uid: user.id }

      if user.review_staff?
        # Applications on projects in their jurisdictions, including new
        # drafts. Opening a new draft is denied by show?.
        clauses << <<-SQL.squish
          EXISTS (
            SELECT 1 FROM permit_projects pp
            WHERE pp.id = permit_applications.permit_project_id
              AND pp.jurisdiction_id IN (:jur_ids)
          )
        SQL
        values[:jur_ids] = user.jurisdictions.pluck(:id)
      end

      # Every rule is limited to the current sandbox (live when nil).
      scope
        .for_sandbox(sandbox)
        .where(clauses.map { |c| "(#{c})" }.join(" OR "), values)
        .distinct
    end
  end

  private

  def project_access
    @project_access ||= access.on(record.permit_project)
  end
end
