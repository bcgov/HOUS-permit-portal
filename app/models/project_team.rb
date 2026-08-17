class ProjectTeam < ApplicationRecord
  # Progressive permission levels: a higher level implies every lower one, so
  # effective permissions across several teams are just the per-domain max.
  PROJECT_ACCESS_LEVELS = { none: 0, read: 1, edit: 2 }.freeze
  COLLABORATOR_ACCESS_LEVELS = { none: 0, view: 1, invite: 2, manage: 3 }.freeze
  TEAM_ACCESS_LEVELS = { none: 0, view: 1, manage: 2 }.freeze
  ACCESS_DOMAINS = %i[project_access collaborator_access team_access].freeze

  # TODO(phase 2): an owner team (single member, all domains locked at max) once
  # ownership transfer and jurisdiction-as-owner land.
  AUTO_TEAM_DEFAULTS = {
    leads: {
      name: "Leads",
      project_access: :edit,
      collaborator_access: :manage,
      team_access: :manage
    },
    contributors: {
      name: "Contributors",
      project_access: :none,
      collaborator_access: :none,
      team_access: :none
    },
    all_members: {
      name: "All members",
      project_access: :none,
      collaborator_access: :none,
      team_access: :none
    }
  }.freeze

  belongs_to :permit_project, touch: true

  enum :kind,
       { leads: 0, contributors: 1, all_members: 2, custom: 3 },
       default: :custom
  enum :project_access, PROJECT_ACCESS_LEVELS, prefix: true, default: :none
  enum :collaborator_access,
       COLLABORATOR_ACCESS_LEVELS,
       prefix: true,
       default: :none
  enum :team_access, TEAM_ACCESS_LEVELS, prefix: true, default: :none

  validates :name, presence: true

  after_commit :reindex_permit_project, on: %i[create update]

  # ponytail: auto team membership is derived from ProjectMembership#role rather
  # than stored, so there is no join table and no sync to drift. Ceiling: custom
  # teams need explicit membership -- adding project_team_memberships in phase 2
  # means one extra OR branch here and in ProjectMembership.project_access_sql.
  scope :for_role,
        ->(role) { where(kind: [:all_members, kind_for_role(role)].compact) }

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

  # Auto teams are membership-derived, so their members come from role instead
  # of a join table.
  def members
    return ProjectMembership.none if custom?

    scope = permit_project.project_memberships.kept
    all_members? ? scope : scope.where(role: role_for_kind)
  end

  private

  def role_for_kind
    leads? ? :lead : :contributor
  end

  def reindex_permit_project
    return unless ACCESS_DOMAINS.any? { |domain| previous_changes.key?(domain) }

    permit_project&.reindex
  end
end
