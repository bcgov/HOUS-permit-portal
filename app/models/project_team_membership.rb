# Explicit membership on a custom team. Joins the project membership rather than
# the user, so a pending invitation can be pre-assigned to a team; the
# accepted_at checks in ProjectPermissions and project_access_sql keep it from
# granting anything until the invitation is accepted.
class ProjectTeamMembership < ApplicationRecord
  belongs_to :project_team
  belongs_to :project_membership

  validates :project_membership_id, uniqueness: { scope: :project_team_id }
  validate :team_is_custom
  validate :team_and_membership_share_a_project

  after_commit :reindex_permit_project, on: %i[create destroy]

  private

  # Leads/contributors/all_members membership is derived from role, so storing it
  # would be a second source of truth.
  def team_is_custom
    return if project_team.blank? || project_team.custom?

    errors.add(:project_team, :must_be_custom)
  end

  # Ids arrive from request params, so this is a trust boundary: without it a
  # team could be granted access to a member of another project.
  def team_and_membership_share_a_project
    return if project_team.blank? || project_membership.blank?
    if project_team.permit_project_id == project_membership.permit_project_id
      return
    end

    errors.add(:project_membership, :different_project)
  end

  def reindex_permit_project
    project_team&.permit_project&.reindex
  end
end
