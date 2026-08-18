class PermitProjectPolicy < ApplicationPolicy
  # ponytail: mirrors the legacy bridge in PermitProject#permissions_for so a
  # submission collaborator created under the old model still lists their
  # projects. Remove with the phase 2 migration of collaborations onto teams.
  LEGACY_SUBMISSION_COLLABORATION_SQL = <<-SQL.squish
    EXISTS (
      SELECT 1 FROM collaborators c
      JOIN permit_collaborations pc ON pc.collaborator_id = c.id
      JOIN permit_applications pa ON pa.id = pc.permit_application_id
      WHERE pa.permit_project_id = permit_projects.id
        AND pc.collaboration_type = :submission_type
        AND pc.discarded_at IS NULL
        AND c.user_id = :uid
    )
  SQL

  class Scope < Scope
    def resolve
      clauses = [
        "permit_projects.owner_id = :uid",
        ProjectMembership.kept_for_user_sql(
          project_id_sql: "permit_projects.id"
        ),
        LEGACY_SUBMISSION_COLLABORATION_SQL
      ]
      values = {
        uid: user.id,
        submission_type:
          PermitCollaboration.collaboration_types.fetch(:submission)
      }

      if user.review_staff?
        clauses << "permit_projects.jurisdiction_id IN (:jur_ids)"
        values[:jur_ids] = user.jurisdictions.pluck(:id)
      end

      scope.where(clauses.map { |c| "(#{c})" }.join(" OR "), values).distinct
    end
  end

  # Check if the user can index/list projects (relies on the Scope above for actual filtering)
  def index?
    project_listed?
  end

  def pinned?
    index?
  end

  # This is for authorizing a specific project instance (e.g., in a show action).
  def show?
    project_listed? || user_is_review_staff_for_jurisdiction?
  end

  def create?
    true
  end

  def update?
    permissions.project_edit?
  end

  def destroy?
    user_is_owner?
  end

  def pin?
    project_listed?
  end

  def unpin?
    project_listed?
  end

  def search_permit_applications?
    permissions.project_read?
  end

  def search_activities?
    permissions.project_read? || user_is_review_staff_for_jurisdiction?
  end

  def mark_as_viewed?
    user_is_review_staff_for_jurisdiction?
  end

  def mark_as_unviewed?
    user_is_review_staff_for_jurisdiction?
  end

  def transition_state?
    user_is_review_staff_for_jurisdiction? && !record.draft?
  end

  # Allow bulk creation of permit applications under a project
  def create_permit_applications?
    permissions.project_edit?
  end

  def submission_collaborator_options?
    user_is_owner?
  end

  def assign_project_review_collaborator?
    user_is_review_staff_for_jurisdiction?
  end

  def unassign_project_review_collaborator?
    user_is_review_staff_for_jurisdiction?
  end

  def reorder?
    user&.review_staff?
  end

  def jurisdiction_options?
    # Collection action – rely on policy_scope to restrict data
    true
  end

  def download_notes_csv?
    show?
  end

  private

  # Collection actions authorize the class rather than a record, so every helper
  # has to tolerate a record that is not a project instance.
  def permissions
    unless user && record.respond_to?(:permissions_for)
      return ProjectPermissions.none
    end

    record.permissions_for(user)
  end

  def user_is_owner?
    return false unless user && record.respond_to?(:owner_id)

    record.owner_id == user.id
  end

  # Membership is the floor: a kept member (or owner) can find and open the
  # project shell. Full read (`project_read?`) is required to see applications.
  def project_listed?
    user_is_owner? || membership_present? || permissions.project_read?
  end

  def membership_present?
    return false unless user && record.respond_to?(:membership_for)

    record.membership_for(user).present?
  end

  def user_is_review_staff_for_jurisdiction?
    return false unless record.respond_to?(:jurisdiction_id)

    user&.review_staff? && user.member_of?(record.jurisdiction_id)
  end

  # user_context is still useful if you need to check policies of associated items for more granular permissions.
  def user_context
    @user_context ||= UserContext.new(user, sandbox)
  end
end
