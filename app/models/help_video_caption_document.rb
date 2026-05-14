class HelpVideoCaptionDocument < HelpVideoDocument
  def allowed_extensions
    %w[vtt]
  end

  def allowed_mime_types
    %w[text/vtt text/plain]
  end
end
