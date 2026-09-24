class Note < ApplicationRecord
  include HtmlSanitizeAttributes

  sanitizable :body

  NOTEABLE_TYPES = %w[ProjectMeeting SubmissionVersion].freeze
  REVISION_KINDS = %w[applicant_message submitter_message].freeze

  enum :kind,
       {
         meeting: "meeting",
         applicant_message: "applicant_message",
         submitter_message: "submitter_message"
       },
       default: "meeting"

  belongs_to :user
  belongs_to :permit_project
  belongs_to :noteable, polymorphic: true
  has_many :note_attachment_documents, dependent: :destroy, inverse_of: :note

  accepts_nested_attributes_for :note_attachment_documents

  before_validation :assign_permit_project

  validates :body, presence: true
  validates :noteable_type, inclusion: { in: NOTEABLE_TYPES }
  validate :permit_project_matches_noteable

  after_create :increment_meeting_notes_count
  after_destroy :decrement_meeting_notes_count
  after_commit :reindex_noteable

  scope :visible_on_project,
        -> do
          where(
            "notes.kind = :meeting OR notes.published_at IS NOT NULL",
            meeting: "meeting"
          )
        end

  def self.upsert_revision_message!(submission_version:, kind:, body:, user:)
    note = submission_version.notes.find_or_initialize_by(kind: kind)
    html = tip_tap_body(body)
    if html.blank?
      note.destroy! if note.persisted?
      return nil
    end

    note.user = user
    note.body = html
    note.save!
    note
  end

  def self.tip_tap_body(text)
    raw = text.to_s
    return if tiptap_blank?(raw)

    return raw if raw.match?(/<\s*p[\s>]/i)

    raw
      .split(/\r?\n/)
      .map { |line| "<p>#{ERB::Util.html_escape(line)}</p>" }
      .join
  end

  def self.tiptap_blank?(html)
    return true if html.blank?
    return false if html.include?("<img")

    ActionView::Base.full_sanitizer.sanitize(html).strip.blank?
  end

  def self.plain_body(html)
    text = html.to_s.gsub(%r{<br\s*/?>}i, "\n").gsub(%r{</p>}i, "\n")
    ActionView::Base.full_sanitizer.sanitize(text).strip.presence
  end

  def publish!
    return if published_at.present?

    update!(published_at: Time.current)
  end

  def author_name_for(viewer)
    return user&.name unless user&.jurisdiction_staff?
    return user.name if viewer&.jurisdiction_staff?

    permit_project&.jurisdiction&.name
  end

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

  def increment_meeting_notes_count
    return unless noteable_type == "ProjectMeeting"

    ProjectMeeting.increment_counter(:notes_count, noteable_id)
  end

  def decrement_meeting_notes_count
    return unless noteable_type == "ProjectMeeting"

    ProjectMeeting.decrement_counter(:notes_count, noteable_id)
  end

  def reindex_noteable
    noteable&.reindex if noteable.respond_to?(:reindex)
  end
end
