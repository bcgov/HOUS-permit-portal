class ProjectMembership < ApplicationRecord
  include Discard::Model

  # COLLAB TODO(phase 3): `owner` is derived from permit_projects.owner_id rather than
  # being a role here. Ownership transfer by invite, and assigning a jurisdiction
  # as owner, will turn `user` into a polymorphic `member` (User | Jurisdiction).
  belongs_to :permit_project, touch: true
  belongs_to :user, optional: true
  belongs_to :invited_by, class_name: "User", optional: true

  has_many :project_team_memberships, dependent: :destroy
  has_many :custom_teams,
           through: :project_team_memberships,
           source: :project_team

  enum :role, { lead: 0, contributor: 1 }, default: :contributor

  attr_accessor :raw_invitation_token

  before_validation :normalize_invited_email

  validates :invited_email, presence: true
  validates :invited_email,
            uniqueness: {
              scope: :permit_project_id,
              case_sensitive: false,
              conditions: -> { where(discarded_at: nil) },
              message: :already_invited
            }
  validates :user,
            uniqueness: {
              scope: :permit_project_id,
              allow_nil: true,
              conditions: -> { where(discarded_at: nil) },
              message: :already_a_member
            }
  validate :user_is_not_project_owner
  validate :accepted_membership_has_user

  after_commit :reindex_permit_project, on: %i[create update]

  scope :for_user, ->(user) { where(user_id: user.id) }
  scope :accepted, -> { where.not(accepted_at: nil).where.not(user_id: nil) }
  scope :pending, -> { where(accepted_at: nil) }

  def pending?
    accepted_at.blank?
  end

  def accepted?
    accepted_at.present? && user_id.present?
  end

  def invitation_expired?
    return false if accepted?
    return true if invitation_sent_at.blank?

    invitation_sent_at < User.invite_for.ago
  end

  def issue_invitation_token!
    raw = SecureRandom.urlsafe_base64(32)
    self.raw_invitation_token = raw
    update!(
      invitation_token_digest: self.class.digest_invitation_token(raw),
      invitation_sent_at: Time.current
    )
    raw
  end

  def self.find_by_invitation_token(raw)
    return nil if raw.blank?

    kept.find_by(
      invitation_token_digest: digest_invitation_token(raw),
      accepted_at: nil
    )
  end

  def self.digest_invitation_token(raw)
    Digest::SHA256.hexdigest(raw.to_s)
  end

  def accept!(other_user)
    if invitation_expired?
      raise ProjectMembership::InviteService::Error,
            I18n.t("services.project_membership.accept.expired")
    end
    unless pending?
      raise ProjectMembership::InviteService::Error,
            I18n.t("services.project_membership.accept.already_accepted")
    end
    if permit_project.owner_id == other_user.id
      raise ProjectMembership::InviteService::Error,
            I18n.t("services.project_membership.accept.owner_already_member")
    end
    if permit_project.project_memberships.kept.accepted.exists?(
         user_id: other_user.id
       )
      raise ProjectMembership::InviteService::Error,
            I18n.t("services.project_membership.accept.already_a_member")
    end

    update!(
      user: other_user,
      accepted_at: Time.current,
      invitation_token_digest: nil
    )
    self
  end

  # SQL predicate for "this user has an accepted membership on the project
  # referenced by `project_id_sql`". Membership is the floor for listing/showing
  # a project. Pending invites (no user / no accepted_at) do not count.
  # `:uid` must be bound by the caller.
  def self.kept_for_user_sql(project_id_sql:)
    <<-SQL.squish
      EXISTS (
        SELECT 1 FROM project_memberships pm
        WHERE pm.permit_project_id = #{project_id_sql}
          AND pm.user_id = :uid
          AND pm.discarded_at IS NULL
          AND pm.accepted_at IS NOT NULL
      )
    SQL
  end

  # SQL predicate for "this user reaches at least `minimum` on `domain` for the
  # project referenced by `project_id_sql`". Twin of ProjectTeam.for_membership:
  # auto kinds plus explicit custom-team join rows. `:uid` must be bound by the
  # caller. `project_access_sql` defaults to Full read.
  def self.project_access_sql(project_id_sql:, minimum: :read)
    access_sql(
      project_id_sql: project_id_sql,
      domain: :project_access,
      minimum: minimum
    )
  end

  def self.meeting_access_sql(project_id_sql:, minimum: :view)
    access_sql(
      project_id_sql: project_id_sql,
      domain: :meeting_access,
      minimum: minimum
    )
  end

  def self.access_sql(project_id_sql:, domain:, minimum:)
    domain = domain.to_s
    unless ProjectTeam::ACCESS_DOMAINS.map(&:to_s).include?(domain)
      raise ArgumentError, "unknown access domain #{domain}"
    end

    min_value = ProjectTeam.public_send(domain.pluralize).fetch(minimum.to_s)

    <<-SQL.squish
      EXISTS (
        SELECT 1 FROM project_memberships pm
        JOIN project_teams pt ON pt.permit_project_id = pm.permit_project_id
        WHERE pm.permit_project_id = #{project_id_sql}
          AND pm.user_id = :uid
          AND pm.discarded_at IS NULL
          AND pm.accepted_at IS NOT NULL
          AND pt.#{domain} >= #{min_value}
          AND (
            pt.kind = #{ProjectTeam.kinds.fetch("all_members")}
            OR (pt.kind = #{ProjectTeam.kinds.fetch("leads")} AND pm.role = #{roles.fetch("lead")})
            OR (pt.kind = #{ProjectTeam.kinds.fetch("contributors")} AND pm.role = #{roles.fetch("contributor")})
            OR EXISTS (
              SELECT 1 FROM project_team_memberships ptm
              WHERE ptm.project_team_id = pt.id
                AND ptm.project_membership_id = pm.id
            )
          )
      )
    SQL
  end

  def teams
    permit_project.project_teams.for_membership(self)
  end

  private

  def normalize_invited_email
    self.invited_email = invited_email.to_s.strip.downcase.presence
  end

  def user_is_not_project_owner
    return if user_id.blank? || permit_project.blank?
    return unless permit_project.owner_id == user_id

    errors.add(:user, :is_project_owner)
  end

  def accepted_membership_has_user
    return if pending?
    return if user_id.present?

    errors.add(:user, :blank)
  end

  def reindex_permit_project
    unless previous_changes.key?("role") ||
             previous_changes.key?("discarded_at") ||
             previous_changes.key?("id") || previous_changes.key?("user_id") ||
             previous_changes.key?("accepted_at")
      return
    end

    permit_project&.reindex
  end
end
