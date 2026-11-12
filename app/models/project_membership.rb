class ProjectMembership < ApplicationRecord
  searchkick searchable: %i[name], word_start: %i[name]

  belongs_to :user
  belongs_to :permit_project

  acts_as_taggable_on :roles

  enum :access, { standard: 0, expanded: 1, full: 2 }, default: :standard
  # scopes: false — the value `none` would override ActiveRecord::Relation.none
  enum :contact_designation,
       { none: 0, primary: 1, alternate: 2 },
       default: :none,
       scopes: false

  validates :user_id, uniqueness: { scope: :permit_project_id }
  validate :one_primary_contact

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

  private

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
