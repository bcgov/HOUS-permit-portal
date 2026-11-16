class ProjectGrant < ApplicationRecord
  belongs_to :project_membership
  belongs_to :permit_application, optional: true

  enum :kind, { block: 0, application: 1, invite: 2 }, validate: true

  # A grant authorizes only while the member's access still matches it.
  # Block and application grants are Standard. An invite grant is Expanded.
  scope :authorizing,
        -> do
          joins(:project_membership).where(
            <<~SQL.squish,
              (
                project_grants.kind IN (:block_kinds)
                AND project_memberships.access = :standard
              ) OR (
                project_grants.kind = :invite_kind
                AND project_memberships.access = :expanded
              )
            SQL
            block_kinds: [kinds.fetch("block"), kinds.fetch("application")],
            standard: ProjectMembership.accesses.fetch("standard"),
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

  private

  def clear_requirement_block_id_unless_block
    self.requirement_block_id = nil unless block?
  end

  # Invite grants are chosen on the invitation, before the person accepts.
  # Block and application grants still need an accepted member.
  def membership_is_accepted
    return if invite?
    return if project_membership&.active?

    errors.add(:project_membership, "must be an accepted member")
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
    return if (block? || application?) && membership.standard?

    errors.add(:project_membership, "cannot hold this grant")
  end
end
