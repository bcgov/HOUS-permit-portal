class ProjectMembership < ApplicationRecord
  include Discard::Model

  # TODO(phase 2): `owner` is derived from permit_projects.owner_id rather than
  # being a role here. Ownership transfer by invite, and assigning a jurisdiction
  # as owner, will turn `user` into a polymorphic `member` (User | Jurisdiction).
  belongs_to :permit_project, touch: true
  belongs_to :user
  belongs_to :invited_by, class_name: "User", optional: true

  enum :role, { lead: 0, contributor: 1 }, default: :contributor

  validates :user,
            uniqueness: {
              scope: :permit_project_id,
              conditions: -> { where(discarded_at: nil) },
              message: :already_a_member
            }
  validate :user_is_not_project_owner

  after_commit :reindex_permit_project, on: %i[create update]

  scope :for_user, ->(user) { where(user_id: user.id) }

  # SQL predicate for "this user reaches at least `minimum` project access on the
  # project referenced by `project_id_sql`", used by policy scopes so access is
  # decided the same way in Ruby and in SQL. `:uid` must be bound by the caller.
  def self.project_access_sql(project_id_sql:, minimum: :read)
    <<-SQL.squish
      EXISTS (
        SELECT 1 FROM project_memberships pm
        JOIN project_teams pt ON pt.permit_project_id = pm.permit_project_id
        WHERE pm.permit_project_id = #{project_id_sql}
          AND pm.user_id = :uid
          AND pm.discarded_at IS NULL
          AND pt.project_access >= #{ProjectTeam.project_accesses.fetch(minimum.to_s)}
          AND (
            pt.kind = #{ProjectTeam.kinds.fetch("all_members")}
            OR (pt.kind = #{ProjectTeam.kinds.fetch("leads")} AND pm.role = #{roles.fetch("lead")})
            OR (pt.kind = #{ProjectTeam.kinds.fetch("contributors")} AND pm.role = #{roles.fetch("contributor")})
          )
      )
    SQL
  end

  def teams
    permit_project.project_teams.for_role(role)
  end

  private

  def user_is_not_project_owner
    return if user_id.blank? || permit_project.blank?
    return unless permit_project.owner_id == user_id

    errors.add(:user, :is_project_owner)
  end

  def reindex_permit_project
    unless previous_changes.key?("role") ||
             previous_changes.key?("discarded_at") ||
             previous_changes.key?("id")
      return
    end

    permit_project&.reindex
  end
end
