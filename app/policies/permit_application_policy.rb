class PermitApplicationPolicy < ApplicationPolicy
  def show?
    if record.submitter == user ||
         record.collaborator?(user_id: user.id, collaboration_type: :submission)
      true
    elsif user.review_staff?
      user.member_of?(record.jurisdiction.id) && !record.draft? &&
        record.sandbox == sandbox
    end
  end

  def create?
    # Only allow creating a permit application if it is under a permit project
    # owned by the current user
    record.permit_project.present? && record.permit_project.owner_id == user.id
  end

  def mark_as_viewed?
    user.review_staff?
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

  def retrigger_submission_webhook?
    record.submitted? && update?
  end

  def update_version?
    permit_application = record
    designated_submitter =
      permit_application.users_by_collaboration_options(
        collaboration_type: :submission,
        collaborator_type: :delegatee
      ).first

    record.draft? && (record.submitter == user || designated_submitter == user)
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

  def generate_missing_pdfs?
    user.super_admin? || record.submitter == user ||
      ((user.review_staff?) && user.member_of?(record.jurisdiction_id))
  end

  def finalize_revision_requests?
    return false unless user.review_staff? && record.submitted?

    feature_enabled =
      SiteConfiguration.allow_designated_reviewer? &&
        record.jurisdiction.allow_designated_reviewer

    return true unless feature_enabled

    record.permit_collaborations.review.exists?(collaborator_id: user.id)
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
          .present? && permit_collaboration.permit_application.submitted?
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
    record.draft? && record.submitter == user
  end

  def restore?
    record.submitter == user
  end

  # we may want to separate an admin update to a secondary policy

  class Scope < Scope
    def resolve
      submission_type =
        PermitCollaboration.collaboration_types.fetch(:submission)

      exists_sql = <<-SQL.squish
        EXISTS (
          SELECT 1 FROM permit_collaborations pc
          JOIN collaborators c ON c.id = pc.collaborator_id
          WHERE pc.permit_application_id = permit_applications.id
            AND pc.collaboration_type = :submission_type
            AND c.user_id = :uid
        )
      SQL

      owner_exists_sql = <<-SQL.squish
        EXISTS (
          SELECT 1 FROM permit_projects pp
          WHERE pp.id = permit_applications.permit_project_id
            AND pp.owner_id = :uid
        )
      SQL

      clauses = [
        "permit_applications.submitter_id = :uid",
        exists_sql,
        owner_exists_sql
      ]

      values = { uid: user.id, submission_type: submission_type }

      if user.review_staff?
        review_exists_sql = <<-SQL.squish
          EXISTS (
            SELECT 1 FROM permit_projects pp
            WHERE pp.id = permit_applications.permit_project_id
              AND pp.jurisdiction_id IN (:jur_ids)
          )
        SQL

        clauses << "#{review_exists_sql} AND permit_applications.status IN (:submitted_statuses)"
        values[:jur_ids] = user.jurisdictions.pluck(:id)
        values[:submitted_statuses] = PermitApplication
          .submitted_statuses
          .map { |name| PermitApplication.statuses.fetch(name) }
        if sandbox.present?
          clauses.last << " AND permit_applications.sandbox_id = :sandbox_id"
          values[:sandbox_id] = sandbox.id
        end
      end

      scope.where(clauses.map { |c| "(#{c})" }.join(" OR "), values).distinct
    end
  end
end
