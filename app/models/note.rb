class Note < ApplicationRecord
  include HtmlSanitizeAttributes

  sanitizable :body

  NOTEABLE_TYPES = %w[ProjectMeeting].freeze

  belongs_to :user
  belongs_to :permit_project
  belongs_to :noteable, polymorphic: true, counter_cache: true
  has_many :note_attachment_documents, dependent: :destroy, inverse_of: :note

  accepts_nested_attributes_for :note_attachment_documents

  before_validation :assign_permit_project

  validates :body, presence: true
  validates :noteable_type, inclusion: { in: NOTEABLE_TYPES }
  validate :permit_project_matches_noteable

  after_commit :reindex_noteable

  private

  def assign_permit_project
    self.permit_project ||= noteable_permit_project
  end

  def permit_project_matches_noteable
    noteable_project = noteable_permit_project
    return if permit_project.blank? || noteable_project.blank?
    return if permit_project == noteable_project

    errors.add(:permit_project, :invalid)
  end

  def noteable_permit_project
    return noteable if noteable.is_a?(PermitProject)
    return noteable.permit_project if noteable.respond_to?(:permit_project)
    return noteable.parent if noteable.respond_to?(:parent)

    nil
  end

  def reindex_noteable
    noteable&.reindex if noteable.respond_to?(:reindex)
  end
end
