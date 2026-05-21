class HelpVideoVideoDocument < HelpVideoDocument
  def allowed_extensions
    %w[mp4]
  end

  def allowed_mime_types
    %w[video/mp4]
  end
end
