class HelpVideo < ApplicationRecord
  extend FriendlyId
  friendly_id :title, use: :slugged
  include HtmlSanitizeAttributes

  sanitizable :description_html

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

  private

  def required_documents_exist_when_published
    return unless published?

    unless publishable_document?(video_document)
      errors.add(:base, "Video file must exist before publishing")
    end

    unless publishable_document?(caption_document)
      errors.add(:base, "Caption file must exist before publishing")
    end
  end

  def publishable_document?(document)
    document.present? && !document.marked_for_destruction? &&
      document.file_available?
  end
end
