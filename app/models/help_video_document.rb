class HelpVideoDocument < FileUploadAttachment
  belongs_to :help_video, inverse_of: :documents

  include FileUploader.Attachment(:file)
  prepend FilenamePreservingFileUrl

  validates :type, presence: true
  validate :allowed_file_type

  def attached_to
    help_video
  end

  def allowed_extensions
    []
  end

  def allowed_mime_types
    []
  end

  private

  def allowed_file_type
    return unless file_available?

    if allowed_extensions.present? &&
         allowed_extensions.exclude?(file_extension)
      errors.add(:file, "must be a #{allowed_extensions.join(" or ")} file")
    end

    if file_type.present? && allowed_mime_types.present? &&
         allowed_mime_types.exclude?(file_type)
      errors.add(:file, "has an unsupported content type")
    end
  end

  def file_extension
    File.extname(file_name.to_s).delete(".").downcase
  end
end
