class ProjectMembership < ApplicationRecord
  INVITATION_EXPIRY = 72.hours
  # Decline destroys the invite. The comment tells that destroy from a cancel.
  INVITE_DECLINED_AUDIT = "declined"

  searchkick searchable: %i[name], word_start: %i[name]

  # Names only. Email and the invitation token stay out of the activity feed.
  audited on: %i[update destroy],
          only: %i[
            user_id
            invitation_sent_at
            access
            contact_designation
            invited_first_name
            invited_last_name
          ],
          associated_with: :permit_project

  belongs_to :user, optional: true
  belongs_to :permit_project
  belongs_to :invited_by, class_name: "User", optional: true
  has_many :project_grants, dependent: :destroy
  has_many :permit_applications,
           foreign_key: :submitter_membership_id,
           dependent: :nullify,
           inverse_of: :submitter_membership

  acts_as_taggable_on :roles
  # The API calls these role_tags. Tagging stores them on role_list.
  alias_method :role_tags=, :role_list=

  enum :access,
       { limited: 0, expanded: 1, full: 2 },
       default: :limited,
       validate: true
  # scopes: false — the value `none` would override ActiveRecord::Relation.none
  enum :contact_designation,
       { none: 0, primary: 1, alternate: 2 },
       default: :none,
       scopes: false,
       validate: true

  before_validation :normalize_invited_fields

  validates :user_id, uniqueness: { scope: :permit_project_id }, allow_nil: true
  validates :invited_first_name,
            :invited_last_name,
            presence: true,
            if: -> { user_id.nil? }
  validates :invited_email,
            presence: true,
            format: {
              with: URI::MailTo::EMAIL_REGEXP
            },
            if: -> { user_id.nil? }
  validate :unique_pending_or_active_invited_email, if: -> { user_id.nil? }
  validate :one_primary_contact
  validate :keeps_a_full_member, on: :update

  # dependent: :nullify runs in definition order. Prepend so a blocked
  # destroy aborts before the foreign key is cleared.
  before_destroy :keep_last_full_member, prepend: true
  before_update :remember_role_names
  after_create :audit_invitation_sent
  after_update :audit_role_names
  after_destroy :abandon_unattended_project

  after_commit :reindex_permit_project

  scope :search_import, -> { includes(:user) }

  def active?
    user_id.present?
  end

  def expired?
    user_id.nil? && invitation_sent_at.present? &&
      invitation_sent_at < INVITATION_EXPIRY.ago
  end

  def pending?
    !active? && !expired?
  end

  def status
    return "active" if active?
    return "expired" if expired?

    "pending"
  end

  def display_name
    user&.name.presence || "#{invited_first_name} #{invited_last_name}".strip
  end

  def search_data
    {
      name: display_name,
      permit_project_id: permit_project_id,
      access: access,
      role_tags: role_list.to_a,
      created_at: created_at
    }
  end

  def save(**)
    with_primary_transfer { super }
  end

  def save!(**)
    with_primary_transfer { super }
  end

  private

  def normalize_invited_fields
    self.invited_email = invited_email&.strip&.downcase
    self.invited_first_name = invited_first_name&.strip
    self.invited_last_name = invited_last_name&.strip
  end

  def unique_pending_or_active_invited_email
    return if invited_email.blank? || permit_project_id.blank?

    pending_scope =
      self
        .class
        .where(permit_project_id: permit_project_id, user_id: nil)
        .where("LOWER(invited_email) = ?", invited_email.downcase)
    pending_scope = pending_scope.where.not(id: id) if persisted?

    if pending_scope.exists?
      errors.add(:invited_email, :already_invited)
      return
    end

    active_member_exists =
      self
        .class
        .joins(:user)
        .where(permit_project_id: permit_project_id)
        .where.not(users: { confirmed_at: nil })
        .where("LOWER(users.email) = ?", invited_email.downcase)
        .exists?

    errors.add(:invited_email, :already_member) if active_member_exists
  end

  # Demote the previous primary inside this save's transaction, before
  # validation. A failed save rolls the demotion back. before_validation
  # would also run from valid? and change rows that are never saved.
  def with_primary_transfer
    result = nil
    self.class.transaction do
      release_other_primary_contact if claiming_primary_contact?
      result = yield
      raise ActiveRecord::Rollback unless result
    end
    result
  end

  def claiming_primary_contact?
    return false unless active? && primary?

    will_save_change_to_contact_designation? ||
      (will_save_change_to_user_id? && user_id_was.nil?)
  end

  # update_all would skip the activity row for the person who lost primary.
  def release_other_primary_contact
    self
      .class
      .where(
        permit_project_id: permit_project_id,
        contact_designation: :primary
      )
      .where.not(user_id: nil)
      .where.not(id: id)
      .find_each do |membership|
        membership.contact_designation = :none
        membership.save!(validate: false)
      end
  end

  # A membership created with a user is the project owner, not an invitation.
  def audit_invitation_sent
    return if user_id.present?

    write_audit(action: "create", audited_changes: audited_attributes)
  end

  def remember_role_names
    @role_names_before_save = tags_on("roles").map(&:name).sort
  end

  # Role tags are not columns, so the audited update does not see them.
  # Tags chosen on the original invite are not a change.
  def audit_role_names
    return if @role_names_before_save.nil?

    new_names = role_list.to_a.map(&:to_s).sort
    return if new_names == @role_names_before_save

    write_audit(
      action: "update",
      audited_changes: {
        "role_tags" => [@role_names_before_save, new_names]
      }
    )
  end

  def after_audit
    audit = audits.order(version: :desc).first
    return if audit.blank? || audit.audited_changes["person_name"].present?

    name = display_name.presence
    return if name.blank?

    audit.update_columns(
      audited_changes: audit.audited_changes.merge("person_name" => name)
    )
  end

  def keeps_a_full_member
    return unless active? && will_save_change_to_access?
    return unless access_was == "full"
    return if other_active_full_members.exists?

    errors.add(:access, :last_full_member)
  end

  # Removing the project removes every row. Account deletion is allowed to
  # remove the last Full member; that is what abandons the project.
  def keep_last_full_member
    return if destroyed_by_association || !active?
    # The saved row, not an unsaved access assignment. A failed demotion
    # leaves access as Limited in memory while the database row is still Full.
    return unless access_was == "full"
    return if other_active_full_members.exists?

    errors.add(:base, :last_full_member)
    throw :abort
  end

  def abandon_unattended_project
    return unless destroyed_by_association&.active_record == User

    project = PermitProject.unscoped.find_by(id: permit_project_id)
    return if project.blank? || project.destroyed?

    project.abandon_if_unattended!(user)
  end

  def other_active_full_members
    self
      .class
      .where(permit_project_id: permit_project_id, access: :full)
      .where.not(user_id: nil)
      .where.not(id: id)
  end

  def one_primary_contact
    return unless active? && primary?

    others =
      self
        .class
        .where(
          permit_project_id: permit_project_id,
          contact_designation: :primary
        )
        .where.not(user_id: nil)
    others = others.where.not(id: id) if persisted?
    errors.add(:contact_designation, :taken) if others.exists?
  end

  def reindex_permit_project
    return unless Searchkick.callbacks?
    return if permit_project.blank? || permit_project.destroyed?

    permit_project.reindex
  end
end
