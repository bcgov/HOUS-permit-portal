class ProjectTeam < ApplicationRecord
  # Progressive permission levels: a higher level implies every lower one, so
  # effective permissions across several teams are just the per-domain max.
  PROJECT_ACCESS_LEVELS = { base: 0, read: 1, edit: 2 }.freeze
  # One domain covers both the Collaborators and Teams surfaces: teams are only
  # the mechanism for granting collaborator access, so anyone who can manage one
  # can already reach the other. `manage` is therefore access-admin — it can
  # raise a team (or a membership role) to grant itself anything, which is why
  # there is no cap on what a manager may grant.
  COLLABORATOR_ACCESS_LEVELS = { none: 0, view: 1, manage: 2 }.freeze
  MEETING_ACCESS_LEVELS = { none: 0, view: 1, manage: 2 }.freeze
  ACCESS_DOMAINS = %i[project_access collaborator_access meeting_access].freeze

  # COLLAB TODO(phase 3): an owner team (single member, all domains locked at max) once
  # ownership transfer and jurisdiction-as-owner land.
  AUTO_TEAM_DEFAULTS = {
    leads: {
      name: "Leads",
      project_access: :edit,
      collaborator_access: :manage,
      meeting_access: :manage
    },
    contributors: {
      name: "Contributors",
      project_access: :base,
      collaborator_access: :none,
      meeting_access: :none
    },
    all_members: {
      name: "All members",
      project_access: :base,
      collaborator_access: :none,
      meeting_access: :none
    }
  }.freeze

  belongs_to :permit_project, touch: true

  has_many :project_team_memberships, dependent: :destroy
  has_many :project_memberships, through: :project_team_memberships

  enum :kind,
       { leads: 0, contributors: 1, all_members: 2, custom: 3 },
       default: :custom
  enum :project_access, PROJECT_ACCESS_LEVELS, prefix: true, default: :base
  enum :collaborator_access,
       COLLABORATOR_ACCESS_LEVELS,
       prefix: true,
       default: :none
  enum :meeting_access, MEETING_ACCESS_LEVELS, prefix: true, default: :none

  validates :name, presence: true, length: { maximum: 100 }
  validates :name,
            uniqueness: {
              scope: :permit_project_id,
              case_sensitive: false
            }
  validate :auto_team_identity_is_immutable

  before_destroy :prevent_auto_team_destroy

  after_commit :reindex_permit_project, on: %i[create update destroy]

  # Auto team membership stays derived from ProjectMembership#role, so there is
  # nothing to sync for leads/contributors/all_members. Custom teams add the
  # explicit join, which is the second branch here. Its twin lives in
  # ProjectMembership.project_access_sql — change both together or Ruby and SQL
  # disagree about who has access.
  scope :for_membership,
        ->(membership) do
          where(
            kind: [:all_members, kind_for_role(membership.role)].compact
          ).or(
            where(
              id:
                ProjectTeamMembership.where(
                  project_membership_id: membership.id
                ).select(:project_team_id)
            )
          )
        end

  def self.kind_for_role(role)
    case role.to_s
    when "lead"
      :leads
    when "contributor"
      :contributors
    end
  end

  def auto?
    !custom?
  end

  # Accepted members only, for both kinds: a pending invitation pre-assigned to
  # a custom team is not a member until it is accepted.
  def members
    if custom?
      return(
        permit_project.project_memberships.kept.accepted.where(
          id: project_team_memberships.select(:project_membership_id)
        )
      )
    end

    scope = permit_project.project_memberships.kept.accepted
    all_members? ? scope : scope.where(role: role_for_kind)
  end

  # Membership ids to display on the team card. Custom teams include pending
  # pre-assignments so the person who assigned them can see them.
  def displayed_project_membership_ids
    return members.pluck(:id) unless custom?

    permit_project
      .project_memberships
      .kept
      .where(id: project_team_memberships.select(:project_membership_id))
      .pluck(:id)
  end

  private

  def role_for_kind
    leads? ? :lead : :contributor
  end

  # kind_was, not custom?, so an auto team cannot be laundered into a custom one
  # by changing kind and name in the same save.
  def auto_team_identity_is_immutable
    return if new_record? || kind_was == "custom"
    return unless name_changed? || kind_changed?

    errors.add(:base, :auto_team_immutable)
  end

  # kind_was, not custom?: a failed save still leaves the in-memory kind dirty,
  # and that must not launder an auto team into a destroyable custom one.
  # destroyed_by_association means the project itself is going away, which takes
  # its auto teams with it.
  def prevent_auto_team_destroy
    return if kind_was == "custom" || destroyed_by_association.present?

    errors.add(:base, :auto_team_immutable)
    throw(:abort)
  end

  # A destroyed team drops whatever access it granted, so it always reindexes —
  # except when the project itself is going away, which reindexes on its own.
  def reindex_permit_project
    return if destroyed_by_association.present?
    unless destroyed? ||
             ACCESS_DOMAINS.any? { |domain| previous_changes.key?(domain) }
      return
    end

    permit_project&.reindex
  end
end
