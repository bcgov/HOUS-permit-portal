class ProjectMembership < ApplicationRecord
  searchkick searchable: %i[name], word_start: %i[name]

  belongs_to :user
  belongs_to :permit_project

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

  validates :user_id, uniqueness: { scope: :permit_project_id }
  validate :one_primary_contact
  validate :primary_contact_stays

  after_commit :reindex_permit_project

  scope :search_import, -> { includes(:user) }

  def search_data
    {
      name: user.name,
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
    will_save_change_to_contact_designation? && primary?
  end

  def release_other_primary_contact
    self
      .class
      .where(
        permit_project_id: permit_project_id,
        contact_designation: :primary
      )
      .where.not(id: id)
      .update_all(
        contact_designation: self.class.contact_designations.fetch("none")
      )
  end

  def primary_contact_stays
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
    return unless primary?

    others =
      self.class.where(
        permit_project_id: permit_project_id,
        contact_designation: :primary
      )
    others = others.where.not(id: id) if persisted?
    errors.add(:contact_designation, :taken) if others.exists?
  end

  def reindex_permit_project
    return unless Searchkick.callbacks?
    return if permit_project.blank? || permit_project.destroyed?

    permit_project.reindex
  end
end
