class InfoDocument < FileUploadAttachment
  include FileUploader.Attachment(:file)
  prepend FilenamePreservingFileUrl

  acts_as_list column: :sort_order, top_of_list: 0
  acts_as_taggable_on :topics

  validates :title, presence: true
  validates :description, length: { maximum: 256 }, allow_blank: true
  validates :sort_order, numericality: { only_integer: true }
  validate :required_fields_exist_when_published

  scope :published, -> { where.not(published_at: nil) }
  scope :ordered, -> { order(:sort_order, :created_at) }

  # FileUploadAttachment expects a parent; this record is the file.
  def attached_to
    self
  end

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

  def required_fields_exist_when_published
    return unless published?

    if topic_list.empty?
      errors.add(:topics, "must be selected before publishing")
    end

    unless file_available?
      errors.add(:base, "File must exist before publishing")
    end
  end
end
