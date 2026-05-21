class HelpVideo < ApplicationRecord
  extend FriendlyId
  friendly_id :title, use: :slugged
  include HtmlSanitizeAttributes

  sanitizable :about_html

  belongs_to :help_video_section

  has_many :documents,
           class_name: "HelpVideoDocument",
           dependent: :destroy,
           inverse_of: :help_video
  has_one :video_document,
          class_name: "HelpVideoVideoDocument",
          dependent: :destroy,
          inverse_of: :help_video
  has_one :caption_document,
          class_name: "HelpVideoCaptionDocument",
          dependent: :destroy,
          inverse_of: :help_video
  has_one :transcript_document,
          class_name: "HelpVideoTranscriptDocument",
          dependent: :destroy,
          inverse_of: :help_video

  accepts_nested_attributes_for :video_document, allow_destroy: true
  accepts_nested_attributes_for :caption_document, allow_destroy: true
  accepts_nested_attributes_for :transcript_document, allow_destroy: true

  acts_as_list scope: :help_video_section, column: :sort_order, top_of_list: 0

  validates :help_video_section, presence: true
  validates :title, presence: true
  validates :sort_order, numericality: { only_integer: true }
  validates :description, length: { maximum: 256 }, allow_blank: true
  validate :required_documents_exist_when_published

  scope :published, -> { where.not(published_at: nil) }
  scope :ordered, -> { order(:sort_order, :created_at) }

  def published?
    published_at.present?
  end

  def publish!
    update!(published_at: Time.current)
  end

  def unpublish!
    update!(published_at: nil)
  end

  def publish=(value)
    return if value.nil?

    self.published_at =
      (
        if ActiveModel::Type::Boolean.new.cast(value)
          (published_at || Time.current)
        else
          nil
        end
      )
  end

  def previous_help_video_for(user)
    adjacent_help_videos_for(user).first
  end

  def next_help_video_for(user)
    adjacent_help_videos_for(user).last
  end

  def adjacent_help_videos_for(user)
    siblings = nav_siblings_for(user).to_a
    idx = siblings.index { |v| v.id == id }
    return nil, nil if idx.nil?

    prev = idx.positive? ? siblings[idx - 1] : nil
    nxt = siblings[idx + 1]
    [prev, nxt]
  end

  private

  # Neighbors follow the published-only order for everyone viewing a *published* video, so
  # prev/next never point at drafts. Super admins viewing a draft use the full section order
  # so the current video appears in the sibling list.
  def nav_siblings_for(user)
    scope = help_video_section.help_videos.merge(HelpVideo.ordered)
    if user&.super_admin? && !published?
      scope
    else
      scope.published
    end
  end

  def required_documents_exist_when_published
    return unless published?

    unless publishable_document?(video_document)
      errors.add(:base, "Video file must exist before publishing")
    end

    unless publishable_document?(caption_document)
      errors.add(:base, "Caption file must exist before publishing")
    end

    unless publishable_document?(transcript_document)
      errors.add(:base, "Transcript file must exist before publishing")
    end
  end

  def publishable_document?(document)
    document.present? && !document.marked_for_destruction? &&
      document.file_available?
  end
end
