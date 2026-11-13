class PermitApplicationPolicy < ApplicationPolicy
  # submitter_id and the project creator (owner_id) are not checks. Project
  # access is membership; the application creator is created_by.
  # A block grant opens this application only.
  def show?
    return true if can_open?
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

  # A field-revision response is this check while revisions_requested.
  # The save still drops keys that are not a granted block.
  def update?
    return false if record.discarded?

    if record.draft?
      can_edit_granted_blocks?
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

  # Application-wide. Any block grant on this draft is enough.
  def update_version?
    record.draft? && can_edit_granted_blocks?
  end

  def update_revision_requests?
    record.submitted? && user.review_staff?
  end

  # The note covers the whole submission. A block grant does not.
  def update_submitter_note?
    record.revisions_requested? && submission_permitted?
  end

  # Additional information is the whole submission, not one block.
  def upload_revision_fulfillment?
    record.revisions_requested? && submission_permitted?
  end

  # Application-wide. Any block grant on this draft is enough.
  def acknowledge_published_electives?
    record.draft? && can_edit_granted_blocks?
  end

  # The file's block is checked again in the controller.
  def upload_supporting_document?
    record.draft? && can_edit_granted_blocks?
  end

  # Re-submit is this same check: revisions_requested is still a draft.
  # A block grant does not submit. An application grant does.
  def submit?
    return false if record.discarded?

    record.draft? && submission_permitted?
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
    user.super_admin? || can_open? ||
      ((user.review_staff?) && user.member_of?(record.jurisdiction_id))
  end

  # The zip itself is limited to the same blocks as the form.
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

  # Full: any draft. A member who created the draft can archive that one.
  # revisions_requested is still a draft. A submitted application is not.
  def destroy?
    record.draft? && project_access.archive_draft?(record)
  end

  def restore?
    record.draft? && project_access.archive_draft?(record)
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
      resolve_for(:view_application?, block_grants: true)
    end

    private

    def resolve_for(project_check, block_grants: false)
      clauses = [
        ProjectAccess.member_sql(
          project_check,
          "permit_applications.permit_project_id"
        )
      ]
      values = { uid: user.id }

      clauses << <<~SQL.squish if block_grants
          EXISTS (
            SELECT 1 FROM project_grants ag
            INNER JOIN project_memberships grant_pm
              ON grant_pm.id = ag.project_membership_id
            WHERE ag.permit_application_id = permit_applications.id
              AND ag.kind IN (
                #{ProjectGrant.kinds.fetch("block")},
                #{ProjectGrant.kinds.fetch("application")}
              )
              AND grant_pm.user_id = :uid
              AND grant_pm.permit_project_id = permit_applications.permit_project_id
          )
        SQL

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

  def can_open?
    project_access.view_application? || block_granted? || application_granted?
  end

  def can_edit_granted_blocks?
    project_access.edit_application? || block_granted? || application_granted?
  end

  # Full and Expanded pass without a grant row. A Standard member needs an
  # application grant on this application. A block grant never counts.
  def submission_permitted?
    project_access.submit_application? || application_granted?
  end

  def block_granted?
    record.respond_to?(:block_granted_to?) && record.block_granted_to?(user)
  end

  def application_granted?
    record.respond_to?(:application_granted_to?) &&
      record.application_granted_to?(user)
  end
end
