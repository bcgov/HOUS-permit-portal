class ProjectGrant < ApplicationRecord
  belongs_to :project_membership
  belongs_to :permit_application, optional: true
  has_one :permit_project, through: :project_membership

  # A grant removed because the membership is being destroyed is not its own
  # activity row. The membership destroy is the people change.
  audited on: %i[create destroy],
          associated_with: :permit_project,
          if: :record_grant_activity?

  enum :kind, { block: 0, application: 1, invite: 2 }, validate: true

  # A grant authorizes only while the member's access still matches it.
  # Block and application grants are Limited. An invite grant is Expanded.
  scope :authorizing,
        -> do
          joins(:project_membership).where(
            <<~SQL.squish,
              (
                project_grants.kind IN (:block_kinds)
                AND project_memberships.access = :limited
              ) OR (
                project_grants.kind = :invite_kind
                AND project_memberships.access = :expanded
              )
            SQL
            block_kinds: [kinds.fetch("block"), kinds.fetch("application")],
            limited: ProjectMembership.accesses.fetch("limited"),
            invite_kind: kinds.fetch("invite"),
            expanded: ProjectMembership.accesses.fetch("expanded")
          )
        end

  before_validation :clear_requirement_block_id_unless_block

  validates :permit_application, presence: true, unless: :invite?
  validates :permit_application, absence: true, if: :invite?
  validates :requirement_block_id, presence: true, if: :block?
  validates :requirement_block_id, absence: true, unless: :block?
  validates :requirement_block_id,
            uniqueness: {
              scope: %i[project_membership_id permit_application_id kind]
            },
            if: :block?
  validates :permit_application_id,
            uniqueness: {
              scope: %i[project_membership_id kind]
            },
            if: :application?
  validates :project_membership_id, uniqueness: { scope: :kind }, if: :invite?
  validate :membership_is_accepted
  validate :application_on_membership_project
  validate :kind_matches_access

  def self.build_for_application(
    application,
    membership_id:,
    kind:,
    requirement_block_id:
  )
    raise ActiveRecord::RecordNotFound unless application_kind?(kind)

    application
      .permit_project
      .project_memberships
      .find(membership_id)
      .project_grants
      .new(
        kind: kind,
        permit_application: application,
        requirement_block_id: requirement_block_id
      )
  end

  def self.build_invite_grant(project, membership_id:)
    project
      .project_memberships
      .find(membership_id)
      .project_grants
      .new(kind: :invite)
  end

  def self.application_kind?(kind)
    kind = kind.to_s
    kind != "invite" && kinds.key?(kind)
  end
  private_class_method :application_kind?

  def record_grant_activity?
    destroyed_by_association.blank?
  end

  def after_audit
    audit = audits.order(version: :desc).first
    return if audit.blank?

    extra = {
      "person_name" => project_membership&.display_name.presence,
      "application_name" => permit_application&.nickname.presence,
      "block_name" => activity_block_name.presence
    }.compact
    merged = audit.audited_changes.merge(extra)
    return if merged == audit.audited_changes

    audit.update_columns(audited_changes: merged)
  end

  private

  def activity_block_name
    return unless block? && requirement_block_id.present?

    permit_application&.template_version&.requirement_blocks_json&.dig(
      requirement_block_id,
      "name"
    )
  end

  def clear_requirement_block_id_unless_block
    self.requirement_block_id = nil unless block?
  end

  # Invite grants are chosen on the invitation, before the person accepts.
  # A block or application grant can be stored on a pending invite. It
  # authorizes only after that membership has a user. An expired invite cannot.
  def membership_is_accepted
    return if invite?
    return if project_membership&.active? || project_membership&.pending?

    errors.add(:project_membership, "must be a pending or accepted member")
  end

  def application_on_membership_project
    return if invite? || permit_application.blank? || project_membership.blank?
    if permit_application.permit_project_id ==
         project_membership.permit_project_id
      return
    end

    errors.add(:permit_application, "must belong to the member's project")
  end

  def kind_matches_access
    membership = project_membership
    return if membership.blank?
    return if invite? && membership.expanded?
    return if (block? || application?) && membership.limited?

    errors.add(:project_membership, "cannot hold this grant")
  end
end
