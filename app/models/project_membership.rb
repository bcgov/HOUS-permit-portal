class ProjectMembership < ApplicationRecord
  INVITATION_EXPIRY = 72.hours

  searchkick searchable: %i[name], word_start: %i[name]

  belongs_to :user, optional: true
  belongs_to :permit_project
  belongs_to :invited_by, class_name: "User", optional: true

  acts_as_taggable_on :roles
  # The API calls these role_tags. Tagging stores them on role_list.
  alias_method :role_tags=, :role_list=

  enum :access,
       { standard: 0, expanded: 1, full: 2 },
       default: :standard,
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
  validate :primary_contact_stays

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
    self.class.transaction do
      release_other_primary_contact if claiming_primary_contact?
      result = yield
      raise ActiveRecord::Rollback unless result
      result
    end
  end

  def claiming_primary_contact?
    return false unless active? && primary?

    will_save_change_to_contact_designation? ||
      (will_save_change_to_user_id? && user_id_was.nil?)
  end

  def release_other_primary_contact
    self
      .class
      .where(
        permit_project_id: permit_project_id,
        contact_designation: :primary
      )
      .where.not(user_id: nil)
      .where.not(id: id)
      .update_all(
        contact_designation: self.class.contact_designations.fetch("none")
      )
  end

  def primary_contact_stays
    return unless active? && user_id_was.present?
    return unless will_save_change_to_contact_designation?
    return unless was_primary?
    return if primary?

    errors.add(:contact_designation, :primary_locked)
  end

  def was_primary?
    previous = contact_designation_was
    previous == "primary" ||
      previous == self.class.contact_designations.fetch("primary")
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
