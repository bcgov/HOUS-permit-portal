class Note < ApplicationRecord
  include HtmlSanitizeAttributes

  sanitizable :body

  NOTEABLE_TYPES = %w[ProjectMeeting SubmissionVersion PermitApplication].freeze
  REVISION_KINDS = %w[applicant_message submitter_message].freeze

  enum :kind,
       {
         meeting: "meeting",
         applicant_message: "applicant_message", # is a message TO the applicant
         submitter_message: "submitter_message", # is a message TO the reviewer
         creation_message: "creation_message" # is a message TO the submitter about an added application
       },
       default: "meeting"

  belongs_to :user, optional: true
  belongs_to :permit_project
  belongs_to :noteable, polymorphic: true
  delegate :sandbox_id, to: :permit_project
  has_many :note_attachment_documents, dependent: :destroy, inverse_of: :note

  accepts_nested_attributes_for :note_attachment_documents

  before_validation :assign_permit_project

  validates :body, presence: true
  validates :user, presence: true, if: :meeting?
  validates :noteable_type, inclusion: { in: NOTEABLE_TYPES }
  validate :permit_project_matches_noteable
  validate :kind_matches_noteable

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

  def self.create_creation_message!(permit_application:, body:, user:)
    html = tip_tap_body(body)
    return if html.blank?

    permit_application.notes.create!(
      kind: :creation_message,
      body: html,
      user: user,
      published_at: Time.current
    )
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
    return jurisdiction_name if user.blank?
    return user.name unless user.jurisdiction_staff?
    return user.name if viewer&.jurisdiction_staff?

    permit_project&.jurisdiction&.qualified_name
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

  def kind_matches_noteable
    expected =
      case kind
      when "meeting"
        "ProjectMeeting"
      when "creation_message"
        "PermitApplication"
      when *REVISION_KINDS
        "SubmissionVersion"
      end
    return if expected.blank? || noteable_type == expected

    errors.add(:noteable_type, :invalid)
  end

  def jurisdiction_name
    permit_project&.jurisdiction&.qualified_name
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
