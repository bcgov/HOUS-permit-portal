# Effective project-wide permissions for one user on one project: a level per
# domain, where each level implies every lower one. Permissions are additive
# across teams, which for progressive levels is simply the per-domain max.
class ProjectPermissions
  LEVELS = {
    project_access: ProjectTeam::PROJECT_ACCESS_LEVELS,
    collaborator_access: ProjectTeam::COLLABORATOR_ACCESS_LEVELS,
    team_access: ProjectTeam::TEAM_ACCESS_LEVELS
  }.freeze

  def self.none
    new(LEVELS.transform_values { 0 })
  end

  def self.owner
    new(LEVELS.transform_values { |levels| levels.values.max })
  end

  def self.from_teams(teams)
    teams.reduce(none) do |permissions, team|
      permissions.at_least(
        LEVELS.keys.index_with { |domain| team.public_send(domain) }
      )
    end
  end

  def initialize(levels)
    @levels = LEVELS.keys.index_with { |domain| levels[domain].to_i }
  end

  # Returns a new value raised to at least the given levels (names or integers),
  # given either as a hash or as keywords.
  def at_least(levels)
    self.class.new(
      @levels.merge(
        levels
          .transform_keys(&:to_sym)
          .to_h do |domain, level|
            [domain, [@levels.fetch(domain), level_value(domain, level)].max]
          end
      )
    )
  end

  def project_read?
    at_least?(:project_access, :read)
  end

  def project_edit?
    at_least?(:project_access, :edit)
  end

  def collaborators_view?
    at_least?(:collaborator_access, :view)
  end

  def collaborators_invite?
    at_least?(:collaborator_access, :invite)
  end

  def collaborators_manage?
    at_least?(:collaborator_access, :manage)
  end

  def teams_view?
    at_least?(:team_access, :view)
  end

  def teams_manage?
    at_least?(:team_access, :manage)
  end

  def at_least?(domain, level)
    @levels.fetch(domain) >= level_value(domain, level)
  end

  # Level names, for the API payload.
  def to_h
    @levels.to_h do |domain, value|
      [domain, LEVELS.fetch(domain).key(value).to_s]
    end
  end

  def ==(other)
    other.is_a?(self.class) && to_h == other.to_h
  end

  private

  def level_value(domain, level)
    return level if level.is_a?(Integer)

    LEVELS.fetch(domain).fetch(level.to_sym)
  end
end
